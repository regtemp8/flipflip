import { ImageViewData, ViewerEvent } from 'flipflip-common'
import { flipflipApi } from '../api/slice'
import { AppDispatch, RootState } from '../store'
import {
  ImageViewState,
  setImagePlayerAdvanceTimeout,
  setImagePlayerCurrentSceneID,
  setImagePlayerIFrameCount,
  setImagePlayerIsLoading,
  setImagePlayerLoadingComplete,
  setImagePlayerReadyToDisplay,
  setImagePlayerSetImageView,
  setImagePlayerShownImageView,
  setImagePlayersPaused,
  setImagePlayersPlaying,
  setImagePlayerStartLoading
} from './slice'
import { DisplayItem } from '../../components/player/ImagePlayer'
import imageTimers from './ImageTimerService'

export function pauseImagePlayers() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    Object.entries(state.imagePlayer).forEach(([uuid, value]) => {
      if (value.hasStarted && value.isPlaying && value.advanceTimeout != null) {
        window.cancelAnimationFrame(value.advanceTimeout)
        imageTimers().pause(uuid)
      }
    })
    dispatch(setImagePlayersPaused())
  }
}

export function resumeImagePlayers() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const resume = Object.values(state.imagePlayer).every(
      (value) => value.hasStarted && !value.isPlaying
    )
    if (resume) {
      dispatch(startImagePlayers())
    }
  }
}

export function startImagePlayers() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const advanceImagePlayerFn = (uuid: string) => {
      return (timestamp: DOMHighResTimeStamp) => {
        const requestPlayerAdvance = (id: string) => {
          const advanceTimeout = window.requestAnimationFrame(
            advanceImagePlayerFn(id)
          )
          dispatch(setImagePlayerAdvanceTimeout({ uuid: id, value: advanceTimeout }))
        }

        const skipFrame = imageTimers().tick(uuid, timestamp)
        if(skipFrame) {
          requestPlayerAdvance(uuid)
          return
        }

        let index = 0
        const state = getState()
        const { readyToDisplay, currentSceneID } = state.imagePlayer[uuid]
        const sceneReadyToDisplay = readyToDisplay[currentSceneID]
        if (sceneReadyToDisplay[index] == null) {
          const retries = imageTimers().retry(uuid)
          if (retries === 6 && sceneReadyToDisplay.length > 0) {
            // waited long enough, try next
            index++
          } else {
            requestPlayerAdvance(uuid)
            return
          }
        }

        const item = sceneReadyToDisplay[index]
        imageTimers().next(uuid, item.duration)
        dispatch(shownImageView(uuid, item, index))
        requestPlayerAdvance(uuid)
      }
    }

    const state = getState()
    const advanceTimeouts: Record<string, number> = {}
    Object.keys(state.imagePlayer).forEach((uuid) => {
      const advanceTimeout = window.requestAnimationFrame(
        advanceImagePlayerFn(uuid)
      )
      advanceTimeouts[uuid] = advanceTimeout
    })
    dispatch(setImagePlayersPlaying(advanceTimeouts))
  }
}

export function loadImageViews(uuid: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const player = state.imagePlayer[uuid]
    if (player == null || player.isLoading) {
      return
    }

    dispatch(setImagePlayerIsLoading({ uuid, value: true }))
    const { loader } = player
    const canLoad = Math.min(
      loader.maxCanLoadAtOnce - loader.loadingCount,
      loader.readyToLoad.length
    )
    if (canLoad <= 0) {
      dispatch(setImagePlayerIsLoading({ uuid, value: false }))
      return
    }

    let items: ImageViewData[] = []
    try {
      const result = await dispatch(
        flipflipApi.endpoints.getViewPlayerItems.initiate(
          { id: uuid, size: canLoad },
          { forceRefetch: true }
        )
      )
      if (result.data != null) {
        items = result.data
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    }

    let iframeCount = loader.iframeCount
    const maxIframeCount = 2
    dispatch(setImagePlayerStartLoading({ uuid, value: items.length }))
    items.forEach((item, i) => {
      const index = loader.readyToLoad[i]
      let keep = loader.imageViews[index]?.data.url !== item.data.url // if url hasn't changed, then onload event isn't triggered

      if (keep && item.data.type === 'iframe') {
        if (iframeCount < maxIframeCount) {
          iframeCount++
        } else {
          // TODO bring back onlyIframes, so that a scene with only iframes stops loading
          keep = false
        }
      }

      if (keep) {
        const imageView: ImageViewState = {
          ...item,
          show: false,
          zIndex: -1
        }

        dispatch(
          setImagePlayerSetImageView({
            uuid,
            value: { index, view: imageView }
          })
        )
      } else {
        const displayItem: DisplayItem = {
          index,
          sceneID: item.sceneId,
          duration: item.view.timeToNextFrame
        }
        dispatch(discardedImageView(uuid, displayItem))
      }
    })

    dispatch(setImagePlayerIFrameCount({ uuid, value: iframeCount }))
    dispatch(setImagePlayerIsLoading({ uuid, value: false }))
    dispatch(loadImageViews(uuid))
  }
}

export function shownImageView(uuid: string, item: DisplayItem, index: number) {
  return async (dispatch: AppDispatch) => {
    const event: ViewerEvent = {
      event: 'shown',
      sceneId: item.sceneID,
      duration: item.duration
    }
    const { data } = await dispatch(
      flipflipApi.endpoints.sendViewPlayerEvent.initiate({ id: uuid, event })
    )
    dispatch(setImagePlayerShownImageView({ uuid, value: index }))
    if (data != null) {
      dispatch(
        setImagePlayerCurrentSceneID({ uuid, value: data.value as number })
      )
    }
  }
}

export function readyToDisplayImageView(
  uuid: string,
  item: DisplayItem,
  displayIndex?: number
) {
  return async (dispatch: AppDispatch) => {
    const event: ViewerEvent = {
      event: 'loaded',
      sceneId: item.sceneID,
      duration: item.duration
    }
    await dispatch(
      flipflipApi.endpoints.sendViewPlayerEvent.initiate({ id: uuid, event })
    )
    dispatch(
      setImagePlayerReadyToDisplay({ uuid, value: { item, displayIndex } })
    )
    dispatch(loadImageViews(uuid))
  }
}

export function discardedImageView(uuid: string, item: DisplayItem) {
  return async (dispatch: AppDispatch) => {
    const event: ViewerEvent = {
      event: 'discarded',
      sceneId: item.sceneID,
      duration: item.duration
    }
    await dispatch(
      flipflipApi.endpoints.sendViewPlayerEvent.initiate({ id: uuid, event })
    )

    dispatch(
      setImagePlayerLoadingComplete({
        uuid,
        value: item.index
      })
    )
    dispatch(loadImageViews(uuid))
  }
}
