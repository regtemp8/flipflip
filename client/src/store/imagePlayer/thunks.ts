import { ImageViewData, ViewerEvent } from 'flipflip-common'
import { flipflipApi } from '../api/slice'
import { AppDispatch, RootState } from '../store'
import {
  ImageViewState,
  setImagePlayerCurrentSceneID,
  setImagePlayerIFrameCount,
  setImagePlayerIsLoading,
  setImagePlayerLoadingComplete,
  setImagePlayerReadyToDisplay,
  setImagePlayerSetImageView,
  setImagePlayerShownImageView,
  setImagePlayerStartLoading
} from './slice'
import { DisplayItem } from '../../components/player/ImagePlayer'

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

export function shownImageView(uuid: string, item: DisplayItem) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const event: ViewerEvent = {
      event: 'shown',
      sceneId: item.sceneID,
      duration: item.duration
    }
    const { data } = await dispatch(
      flipflipApi.endpoints.sendViewPlayerEvent.initiate({ id: uuid, event })
    )
    if (data != null) {
      dispatch(
        setImagePlayerCurrentSceneID({ uuid, value: data.value as number })
      )
    }
    dispatch(setImagePlayerShownImageView({ uuid, value: item.index }))
  }
}

export function readyToDisplayImageView(uuid: string, item: DisplayItem) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const event: ViewerEvent = {
      event: 'loaded',
      sceneId: item.sceneID,
      duration: item.duration
    }
    await dispatch(
      flipflipApi.endpoints.sendViewPlayerEvent.initiate({ id: uuid, event })
    )
    dispatch(setImagePlayerReadyToDisplay(uuid))
    dispatch(loadImageViews(uuid))
  }
}

export function discardedImageView(uuid: string, item: DisplayItem) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const event: ViewerEvent = {
      event: 'discarded',
      sceneId: item.sceneID,
      duration: item.duration
    }
    await dispatch(
      flipflipApi.endpoints.sendViewPlayerEvent.initiate({ id: uuid, event })
    )

    dispatch(imagePlayerLoadingComplete(uuid, [item.index]))
  }
}

export function imagePlayerLoadingComplete(uuid: string, indexes: number[]) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(
      setImagePlayerLoadingComplete({
        uuid,
        value: indexes
      })
    )
    dispatch(loadImageViews(uuid))
  }
}
