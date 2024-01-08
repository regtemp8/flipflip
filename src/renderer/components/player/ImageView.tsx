import React, { useEffect, useRef } from 'react'
import { animated } from 'react-spring'
import wretch from 'wretch'

import CrossFade from './CrossFade'
import FadeInOut from './FadeInOut'
import Panning from './Panning'
import Slide from './Slide'
import Strobe from './Strobe'
import StrobeImage from './StrobeImage'
import ZoomMove from './ZoomMove'

import { getRandomColor, getRandomListItem } from '../../data/utils'
import { BT, HTF, IT, OT, SL, ST, TF, VTF } from '../../data/const'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectAppConfigDisplaySettingsCloneGridVideoElements } from '../../../store/app/selectors'
import {
  selectSceneBackgroundType,
  selectSceneBackgroundColor,
  selectSceneBackgroundColorSet,
  selectSceneBackgroundBlur,
  selectSceneVideoVolume,
  selectSceneCrossFade,
  selectSceneCrossFadeAudio,
  selectSceneSlide,
  selectSceneImageOrientation,
  selectSceneVideoOrientation,
  selectSceneImageType,
  selectSceneStrobe,
  selectSceneStrobeLayer,
  selectSceneStrobePulse,
  selectSceneStrobeDelayTF,
  selectSceneStrobeTF,
  selectSceneZoom,
  selectSceneHorizTransType,
  selectSceneVertTransType,
  selectScenePanning,
  selectSceneFadeInOut
} from '../../../store/scene/selectors'
import { Box } from '@mui/system'
import { selectPlayerFirstImageLoaded, selectPlayerHasStarted, selectPlayerSceneID } from '../../../store/player/selectors'
import { setPlayerFirstImageLoaded } from '../../../store/player/slice'

export interface ImageViewProps {
  uuid: string
  isOverlay?: boolean
  image?: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement
  fitParent: boolean
  currentAudio?: number
  gridCoordinates?: number[]
  timeToNextFrame?: number
  toggleStrobe?: boolean
  pictureGrid?: boolean
  removeChild?: boolean
  className?: string
  onLoaded?: () => void
  setSceneCopy?: (children: React.ReactNode) => void
  setVideo?: (video: HTMLVideoElement) => void
}

export default function ImageView(props: ImageViewProps) {
  const dispatch = useAppDispatch()
  const _hasStarted = useRef(useAppSelector(selectPlayerHasStarted(props.uuid)))
  const _firstImageLoaded = useRef(useAppSelector(selectPlayerFirstImageLoaded(props.uuid)))
  const sceneID = useAppSelector(selectPlayerSceneID(props.uuid))
  const _cloneGridVideoElements = useRef<boolean>()
  _cloneGridVideoElements.current = useAppSelector(selectAppConfigDisplaySettingsCloneGridVideoElements())
  const _backgroundType = useRef<string>()
  _backgroundType.current = useAppSelector(
    selectSceneBackgroundType(sceneID)
  )
  const _backgroundColor = useRef<string>()
  _backgroundColor.current = useAppSelector(
    selectSceneBackgroundColor(sceneID)
  )
  const _backgroundColorSet = useRef<string[]>()
  _backgroundColorSet.current = useAppSelector(
    selectSceneBackgroundColorSet(sceneID)
  )
  const _backgroundBlur = useRef<number>()
  _backgroundBlur.current = useAppSelector(
    selectSceneBackgroundBlur(sceneID)
  )
  const _videoVolume = useRef<number>()
  _videoVolume.current = useAppSelector(selectSceneVideoVolume(sceneID))
  const _crossFade = useRef<boolean>()
  _crossFade.current = useAppSelector(selectSceneCrossFade(sceneID))
  const _crossFadeAudio = useRef<boolean>()
  _crossFadeAudio.current = useAppSelector(
    selectSceneCrossFadeAudio(sceneID)
  )
  const _slide = useRef<boolean>()
  _slide.current = useAppSelector(selectSceneSlide(sceneID))
  const _imageOrientation = useRef<string>()
  _imageOrientation.current = useAppSelector(
    selectSceneImageOrientation(sceneID)
  )
  const _videoOrientation = useRef<string>()
  _videoOrientation.current = useAppSelector(
    selectSceneVideoOrientation(sceneID)
  )
  const _imageType = useRef<string>()
  _imageType.current = useAppSelector(selectSceneImageType(sceneID))
  const _strobe = useRef<boolean>()
  _strobe.current = useAppSelector(selectSceneStrobe(sceneID))
  const _strobeLayer = useRef<string>()
  _strobeLayer.current = useAppSelector(selectSceneStrobeLayer(sceneID))
  const _strobePulse = useRef<boolean>()
  _strobePulse.current = useAppSelector(selectSceneStrobePulse(sceneID))
  const _strobeDelayTF = useRef<string>()
  _strobeDelayTF.current = useAppSelector(selectSceneStrobeDelayTF(sceneID))
  const _strobeTF = useRef<string>()
  _strobeTF.current = useAppSelector(selectSceneStrobeTF(sceneID))
  const _zoom = useRef<boolean>()
  _zoom.current = useAppSelector(selectSceneZoom(sceneID))
  const _horizTransType = useRef<string>()  
  _horizTransType.current = useAppSelector(
    selectSceneHorizTransType(sceneID)
  )
  const _vertTransType = useRef<string>()
  _vertTransType.current = useAppSelector(selectSceneVertTransType(sceneID))
  const _panning = useRef<boolean>()
  _panning.current = useAppSelector(selectScenePanning(sceneID))
  const _fadeInOut = useRef<boolean>()
  _fadeInOut.current = useAppSelector(selectSceneFadeInOut(sceneID))

  const _parentHeight = useRef<number>()
  const _parentWidth = useRef<number>()
  const _backgroundRef = useRef<HTMLDivElement>()
  const _contentRef = useRef<HTMLDivElement>()
  const _image = useRef<
    HTMLImageElement | HTMLVideoElement | HTMLIFrameElement
  >()
  const _scale = useRef<number>()
  const _timeouts = useRef<number[]>([])

  const _prevBackgroundType = useRef<string>()
  const _prevHasStarted = useRef<boolean>()

  const _canvas = useRef<HTMLCanvasElement>()

  useEffect(() => {
    _timeouts.current = []
    if(!props.isOverlay && !_firstImageLoaded.current) {
      // console.log('firstImageLoaded')
      dispatch(setPlayerFirstImageLoaded({uuid: props.uuid, value: true}))
    }
    // console.log('MOUNT applyImage')
    //_applyImage()

    return () => {
      clearTimeouts()
      _timeouts.current = []
    }
  }, [])

  // useEffect(() => {
  //   let forceBG = false
  //   if (!props.pictureGrid && _prevBackgroundType.current !== _backgroundType.current) {
  //     if (_backgroundType.current === BT.blur) {
  //       forceBG = true
  //     } else if (
  //       _backgroundType.current === BT.blur &&
  //       _backgroundRef.current?.firstChild
  //     ) {
  //       _backgroundRef.current.removeChild(_backgroundRef.current.firstChild)
  //     }
  //   }
  //   _applyImage(forceBG)
  //   _prevBackgroundType.current = _backgroundType.current
  // }, [
  //   props.image?.src,
  //   props.image?.getAttribute('start'),
  //   props.image?.getAttribute('end'),
  //   _strobe.current,
  //   _fadeInOut.current,
  //   sceneID,
  //   _backgroundType.current,
  //   _hasStarted.current
  // ])

  useEffect(() => {
    const context = _canvas.current?.getContext('2d')
    if(context == null) return

    const image = props.image as HTMLImageElement
    const height = (image.naturalHeight / image.naturalWidth) * context.canvas.width
    context.fillStyle = '#2196f3'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
    context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, context.canvas.width, height)
  }, [props.image])

  const clearTimeouts = () => {
    for (const timeout of _timeouts.current) {
      clearTimeout(timeout)
    }
  }

  const _applyImage = (forceBG = false) => {
    // console.log(`APPLY IMAGE: ${props.uuid}`)    
    const el = _contentRef.current
    const bg = _backgroundRef.current
    const img = undefined //props.image
    // console.log('el: ' + !!el)
    // console.log('img: ' + !!img)
    // console.log('forceBG: ' + forceBG)
    // console.log('======================')
    if (!el || !img) {
      return
    }

    const firstChild = el.firstChild as
      | HTMLImageElement
      | HTMLVideoElement
      | HTMLIFrameElement
    if (
      !forceBG &&
      firstChild &&
      firstChild.src === img.src &&
      firstChild.getAttribute('start') === img.getAttribute('start') &&
      firstChild.getAttribute('end') === img.getAttribute('end')
    ) {
      return
    }

    if (
      !forceBG &&
      img instanceof HTMLVideoElement &&
      img.hasAttribute('subtitles')
    ) {
      try {
        const subURL = img.getAttribute('subtitles') as string
        wretch(subURL)
          .get()
          .blob((blob) => {
            const track: any = document.createElement('track')
            track.kind = 'captions'
            track.label = 'English'
            track.srclang = 'en'
            track.src = URL.createObjectURL(blob)
            if (img.textTracks.length === 0) {
              img.append(track)
            } else {
              img.textTracks[0] = track
            }
            track.mode = 'showing'
            img.textTracks[0].mode = 'showing'
          })
      } catch (e) {
        console.error(e)
      }
    }

    const videoLoop = (v: any) => {
      if (
        !el || !el.parentElement ||
        parseFloat(el.parentElement.style.opacity) === 0.99 ||
        v.paused ||
        _timeouts.current == null
      ) {
        return
      }
      if (v.ended) {
        v.onended(null)
        return
      }

      if (
        !props.pictureGrid &&
        _hasStarted.current &&
        _crossFade.current &&
        _crossFadeAudio.current &&
        v instanceof HTMLVideoElement
      ) {
        const volume = v.hasAttribute('volume')
          ? parseInt(v.getAttribute('volume') as string)
          : _videoVolume.current
        v.volume =
          (volume / 100) *
          parseFloat(
            el.parentElement.parentElement.getAttribute('volume') as string
          )
      }
      if (v.hasAttribute('start') && v.hasAttribute('end')) {
        const start = v.getAttribute('start')
        const end = v.getAttribute('end')
        if (v.currentTime > end) {
          v.onended(null)
          v.currentTime = start
        }
      }
      _timeouts.current.push(window.setTimeout(videoLoop, 100, v))
    }

    const drawLoop = (
      v: any,
      c: CanvasRenderingContext2D,
      w: number,
      h: number
    ) => {
      if (
        !el || !el.parentElement ||
        parseFloat(el.parentElement.style.opacity) === 0.99 ||
        _timeouts.current == null
      ) {
        return
      }
      c.drawImage(v, 0, 0, w, h)
      _timeouts.current.push(window.setTimeout(drawLoop, 20, v, c, w, h))
    }

    const extraDrawLoop = (v: any, w: number, h: number) => {
      if (
        !el || !el.parentElement ||
        parseFloat(el.parentElement.style.opacity) === 0.99 ||
        v.ended ||
        v.paused ||
        _timeouts.current == null
      ) {
        return
      }
      for (const canvas of document.getElementsByClassName(
        'canvas-' + props.gridCoordinates![0] + '-' + props.gridCoordinates![1]
      )) {
        const context = (canvas as HTMLCanvasElement).getContext(
          '2d'
        ) as CanvasRenderingContext2D
        context.drawImage(v, 0, 0, w, h)
      }
      _timeouts.current.push(window.setTimeout(extraDrawLoop, 20, v, w, h))
    }

    const extraBGDrawLoop = (v: any, w: number, h: number) => {
      if (
        !el || !el.parentElement ||
        parseFloat(el.parentElement.style.opacity) === 0.99 ||
        _timeouts.current == null
      ) {
        return
      }
      for (const canvas of document.getElementsByClassName(
        'canvas-bg-' +
          props.gridCoordinates![0] +
          '-' +
          props.gridCoordinates![1]
      )) {
        const context = (canvas as HTMLCanvasElement).getContext(
          '2d'
        ) as CanvasRenderingContext2D
        context.drawImage(v, 0, 0, w, h)
      }
      _timeouts.current.push(window.setTimeout(extraBGDrawLoop, 20, v, w, h))
    }

    let parentWidth = el.offsetWidth
    let parentHeight = el.offsetHeight
    if (props.fitParent) {
      parentWidth = el.parentElement.offsetWidth
      parentHeight = el.parentElement.offsetHeight
    }
    if (parentWidth === 0 || parentHeight === 0) {
      parentWidth = window.innerWidth
      parentHeight = window.innerHeight
    }
    if (
      parentHeight !== _parentHeight.current ||
      parentWidth !== _parentWidth.current
    ) {
      _parentHeight.current = parentHeight
      _parentWidth.current = parentWidth
    }
    const parentAspect = parentWidth / parentHeight
    let imgWidth: number;
    let imgHeight: number;
    let scale = 1
    let bgscale = 1
    let type = null
    if (img instanceof HTMLImageElement) {
      imgWidth = img.width
      imgHeight = img.height
    } else if (img instanceof HTMLVideoElement) {
      type = ST.video
      imgWidth = img.videoWidth
      imgHeight = img.videoHeight
      if (img.paused) img.play().catch((err) => console.warn(err))
    } else if (img instanceof HTMLIFrameElement) {
      type = ST.nimja
    }
    let imgAspect = imgWidth / imgHeight

    const rotate =
      !props.pictureGrid &&
      ((type === ST.video &&
        ((_videoOrientation.current === OT.forceLandscape && imgWidth < imgHeight) ||
          (_videoOrientation.current === OT.forcePortrait && imgWidth > imgHeight))) ||
        (type == null &&
          ((_imageOrientation.current === OT.forceLandscape && imgWidth < imgHeight) ||
            (_imageOrientation.current === OT.forcePortrait && imgWidth > imgHeight))))

    const blur =
      !props.pictureGrid && _backgroundType.current === BT.blur && type !== ST.nimja
    let bgImg: any
    if (blur) {
      if (img.src.endsWith('.gif')) {
        bgImg = img.cloneNode()
      } else {
        bgImg = document.createElement('canvas')

        const context = bgImg.getContext('2d')
        bgImg.width = parentWidth
        bgImg.height = parentHeight

        if (!_crossFade.current) {
          clearTimeouts()
        }
        if (type == null) {
          context.drawImage(img, 0, 0, parentWidth, parentHeight)
        } else if (type === ST.video) {
          if (forceBG) {
            drawLoop(img, context, parentWidth, parentHeight)
            if (props.gridCoordinates) {
              extraDrawLoop(img, imgWidth * scale, imgHeight * scale)
              extraBGDrawLoop(img, parentWidth, parentHeight)
            }
          } else {
            img.onplay = () => {
              videoLoop(img)
              if (props.gridCoordinates) {
                extraDrawLoop(img, imgWidth * scale, imgHeight * scale)
              }
            }
            drawLoop(img, context, parentWidth, parentHeight)
            if (props.gridCoordinates) {
              extraBGDrawLoop(img, parentWidth, parentHeight)
            }
          }
        }
      }

      if (rotate) {
        bgImg.style.transform = 'rotate(270deg)'
        if (imgAspect > parentAspect) {
          if (imgWidth > imgHeight) {
            bgscale = (parentHeight + 0.04 * parentHeight) / imgHeight
            bgImg.style.width = imgWidth * bgscale + 'px'
            bgImg.style.height = parentWidth + 'px'
            bgImg.style.marginTop = (parentHeight - parentWidth) / 2 + 'px'
            bgImg.style.marginLeft =
              (parentWidth - imgWidth * bgscale) / 2 + 'px'
          } else {
            bgscale = (parentWidth + 0.04 * parentWidth) / imgWidth
            bgImg.style.width = parentHeight + 'px'
            bgImg.style.height = imgHeight * bgscale + 'px'
            bgImg.style.marginTop =
              (parentHeight - imgHeight * bgscale) / 2 + 'px'
            bgImg.style.marinLeft = (parentWidth - parentHeight) / 2 + 'px'
          }
        } else {
          if (imgWidth > imgHeight) {
            bgscale = (parentHeight + 0.04 * parentHeight) / imgHeight
            bgImg.style.width = imgWidth * bgscale + 'px'
            bgImg.style.height = parentWidth + 'px'
            bgImg.style.marginTop = (parentHeight - parentWidth) / 2 + 'px'
            bgImg.style.marginLeft =
              (parentWidth - imgWidth * bgscale) / 2 + 'px'
          } else {
            bgscale = (parentWidth + 0.04 * parentWidth) / imgWidth
            bgImg.style.width = parentHeight + 'px'
            bgImg.style.height = imgHeight * bgscale + 'px'
            bgImg.style.marginTop =
              parentHeight / 2 - (imgHeight * bgscale) / 2 + 'px'
            bgImg.style.marginLeft = (parentWidth - parentHeight) / 2 + 'px'
          }
        }
      } else {
        if (imgAspect < parentAspect) {
          bgscale = (parentWidth + 0.04 * parentWidth) / imgWidth
          bgImg.style.width = '100%'
          bgImg.style.height = imgHeight * bgscale + 'px'
          bgImg.style.marginTop =
            parentHeight / 2 - (imgHeight * bgscale) / 2 + 'px'
          bgImg.style.marginLeft = '0'
        } else {
          bgscale = (parentHeight + 0.04 * parentHeight) / imgHeight
          bgImg.style.width = imgWidth * bgscale + 'px'
          bgImg.style.height = '100%'
          bgImg.style.marginTop = '0'
          bgImg.style.marginLeft =
            parentWidth / 2 - (imgWidth * bgscale) / 2 + 'px'
        }
      }
    }

    if (!forceBG && img instanceof HTMLVideoElement) {
      if (!props.pictureGrid && _hasStarted.current) {
        const volume = img.hasAttribute('volume')
          ? parseInt(img.getAttribute('volume') as string)
          : _videoVolume.current
        img.volume = volume / 100
      } else {
        img.volume = 0
      }
      img.playbackRate = img.hasAttribute('speed')
        ? parseInt(img.getAttribute('speed') as string) / 10
        : 1
      if (!blur) {
        img.onplay = () => {
          videoLoop(img)
          if (props.gridCoordinates) {
            extraDrawLoop(img, imgWidth * scale, imgHeight * scale)
          }
        }
      }
      if (img.paused) {
        img.play().catch((err) => console.warn(err))
      }
    }

    if (!props.pictureGrid && type !== ST.nimja) {
      switch (_imageType.current) {
        case IT.fitBestClip:
          if (rotate) {
            imgAspect = imgHeight / imgWidth
            img.style.transform = 'rotate(270deg)'
            img.style.transformOrigin = 'top right'
            if (imgAspect < parentAspect) {
              scale = parentWidth / imgHeight
              img.style.height = parentWidth.toString() + 'px'
              img.style.marginLeft = '-' + imgWidth * scale + 'px'
              img.style.marginTop =
                parentHeight / 2 - (imgWidth * scale) / 2 + 'px'
            } else {
              scale = parentHeight / imgWidth
              img.style.width = parentHeight.toString() + 'px'
              img.style.marginLeft =
                -parentHeight +
                (parentWidth / 2 - (imgHeight * scale) / 2) +
                'px'
            }
          } else {
            if (imgAspect > parentAspect) {
              scale = parentHeight / imgHeight
              img.style.width = 'auto'
              img.style.height = '100%'
              img.style.marginTop = '0'
              img.style.marginLeft =
                parentWidth / 2 - (imgWidth * scale) / 2 + 'px'
            } else {
              scale = parentWidth / imgWidth
              img.style.width = '100%'
              img.style.height = 'auto'
              img.style.marginTop =
                parentHeight / 2 - (imgHeight * scale) / 2 + 'px'
              img.style.marginLeft = '0'
            }
          }
          break
        case IT.centerNoClip:
          if (rotate) {
            img.style.transform = 'rotate(270deg)'
            img.style.transformOrigin = 'center'
          }
          const cTop = parentHeight - imgHeight
          const cLeft = parentWidth - imgWidth
          if (cTop >= 0 && cLeft >= 0) {
            img.style.marginTop = cTop / 2 + 'px'
            img.style.marginLeft = cLeft / 2 + 'px'
            break
          }
        default:
        case IT.fitBestNoClip:
          if (rotate) {
            imgAspect = imgHeight / imgWidth
            if (imgAspect < parentAspect) {
              scale = parentHeight / imgWidth
              img.style.width = parentHeight.toString() + 'px'
              img.style.marginLeft =
                -parentHeight +
                (parentWidth / 2 - (imgHeight * scale) / 2) +
                'px'

              img.style.transform = 'rotate(270deg)'
              img.style.transformOrigin = 'top right'
            } else {
              scale = parentWidth / imgHeight
              img.style.height = parentWidth.toString() + 'px'
              img.style.marginLeft = '-' + imgWidth * scale + 'px'
              img.style.marginTop =
                parentHeight / 2 - (imgWidth * scale) / 2 + 'px'

              img.style.transform = 'rotate(270deg)'
              img.style.transformOrigin = 'top right'
            }
          } else {
            if (imgAspect < parentAspect) {
              scale = parentHeight / imgHeight
              img.style.width = 'auto'
              img.style.height = '100%'
              img.style.marginTop = '0'
              img.style.marginLeft =
                parentWidth / 2 - (imgWidth * scale) / 2 + 'px'
            } else {
              scale = parentWidth / imgWidth
              img.style.width = '100%'
              img.style.height = 'auto'
              img.style.marginTop =
                parentHeight / 2 - (imgHeight * scale) / 2 + 'px'
              img.style.marginLeft = '0'
            }
          }
          break
        case IT.stretch:
          if (rotate) {
            scale = parentWidth / imgHeight
            img.style.height = parentWidth.toString() + 'px'
            img.style.marginLeft = '-' + imgWidth * scale + 'px'
            img.style.marginTop =
              parentHeight / 2 - (imgWidth * scale) / 2 + 'px'

            img.style.transform = 'rotate(270deg)'
            img.style.transformOrigin = 'top right'
          } else {
            img.style.objectFit = 'fill'
            img.style.width = '100%'
            img.style.height = '100%'
          }
          break
        case IT.center:
          if (rotate) {
            img.style.transform = 'rotate(270deg)'
            img.style.transformOrigin = 'center'
          }
          const top = parentHeight - imgHeight
          const left = parentWidth - imgWidth
          img.style.marginTop = top / 2 + 'px'
          img.style.marginLeft = left / 2 + 'px'
          break
        case IT.fitWidth:
          if (rotate) {
            scale = parentWidth / imgHeight
            img.style.height = parentWidth.toString() + 'px'
            img.style.marginLeft = '-' + imgWidth * scale + 'px'
            img.style.marginTop =
              parentHeight / 2 - (imgWidth * scale) / 2 + 'px'

            img.style.transform = 'rotate(270deg)'
            img.style.transformOrigin = 'top right'
          } else {
            scale = parentWidth / imgWidth
            img.style.width = '100%'
            img.style.height = 'auto'
            img.style.marginTop =
              parentHeight / 2 - (imgHeight * scale) / 2 + 'px'
            img.style.marginLeft = '0'
          }
          break
        case IT.fitHeight:
          if (rotate) {
            scale = parentHeight / imgWidth
            img.style.width = parentHeight.toString() + 'px'
            img.style.marginLeft =
              -parentHeight + (parentWidth / 2 - (imgHeight * scale) / 2) + 'px'

            img.style.transform = 'rotate(270deg)'
            img.style.transformOrigin = 'top right'
          } else {
            scale = parentHeight / imgHeight
            img.style.width = 'auto'
            img.style.height = '100%'
            img.style.marginTop = '0'
            img.style.marginLeft =
              parentWidth / 2 - (imgWidth * scale) / 2 + 'px'
          }
          break
      }
    } else {
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.marginTop = '0'
      img.style.marginLeft = '0'
    }

    if (!forceBG) {
      if (props.setVideo) {
        // console.log('INVOKE SET_VIDEO')
        props.setVideo(img instanceof HTMLVideoElement ? img : null)
      }

      _image.current = img
      _scale.current = scale

      const appendOriginal = () => {
        if (props.removeChild && el.hasChildNodes()) {
          el.removeChild(el.children.item(0) as Element)
        }
        if (
          img instanceof HTMLVideoElement &&
          props.pictureGrid &&
          img.paused
        ) {
          img.play().catch((err) => console.warn(err))
        }
        if (img instanceof HTMLIFrameElement) {
          img.onload = () => {
            img
              .contentWindow.document.getElementsByClassName('copyright')[0]
              .remove()
            img.contentWindow.document.getElementById('intro-start')!.click()
          }
        }

        if (props.pictureGrid) {
          el.appendChild(img.cloneNode())
        } else {
          el.appendChild(img)
        }
      }
      if (props.gridCoordinates) {
        for (const element of document.getElementsByClassName(
          'copy-' + props.gridCoordinates[0] + '-' + props.gridCoordinates[1]
        )) {
          if (element === el) {
            appendOriginal()
          } else {
            if (
              props.removeChild &&
              element.hasChildNodes() &&
              el.hasChildNodes()
            ) {
              element.removeChild(element.children.item(0) as Element)
            }
            if (img instanceof HTMLVideoElement) {
              if (_cloneGridVideoElements.current) {
                const clone = img.cloneNode() as HTMLVideoElement
                clone.volume = img.volume
                clone.currentTime = img.currentTime
                for (const attr of img.getAttributeNames()) {
                  clone.setAttribute(attr, img.getAttribute(attr) as string)
                }
                clone.play().catch((err) => console.warn(err))
                element.appendChild(clone)
              } else {
                const canvas = document.createElement('canvas')
                canvas.className =
                  'canvas-' +
                  props.gridCoordinates[0] +
                  '-' +
                  props.gridCoordinates[1]
                canvas.width = img.videoWidth * scale
                canvas.height = img.videoHeight * scale
                canvas.style.marginTop = img.style.marginTop
                canvas.style.marginLeft = img.style.marginLeft
                canvas.style.transform = img.style.transform
                canvas.style.transformOrigin = img.style.transformOrigin
                element.appendChild(canvas)
              }
            } else {
              element.appendChild(img.cloneNode())
            }
          }
        }
      } else {
        appendOriginal()
      }
    }
    if (blur) {
      const appendOriginalBG = () => {
        if (props.removeChild && bg.hasChildNodes()) {
          bg.removeChild(bg.children.item(0))
        }
        bg.appendChild(bgImg)
      }
      if (props.gridCoordinates) {
        for (const element of document.getElementsByClassName(
          'copy-bg-' + props.gridCoordinates[0] + '-' + props.gridCoordinates[1]
        )) {
          if (element === bg) {
            appendOriginalBG()
          } else {
            if (
              props.removeChild &&
              element.hasChildNodes() &&
              bg.hasChildNodes()
            ) {
              element.removeChild(element.children.item(0))
            }
            if (
              img instanceof HTMLVideoElement ||
              bgImg instanceof HTMLCanvasElement
            ) {
              const canvas = document.createElement('canvas')
              canvas.className =
                'canvas-bg-' +
                props.gridCoordinates[0] +
                '-' +
                props.gridCoordinates[1]
              canvas.width = bgImg.width
              canvas.height = bgImg.height
              canvas.style.width = bgImg.style.width
              canvas.style.height = bgImg.style.height
              canvas.style.marginTop = bgImg.style.marginTop
              canvas.style.marginLeft = bgImg.style.marginLeft
              canvas.style.transform = bgImg.style.transform
              element.appendChild(canvas)
            } else {
              element.appendChild(bgImg.cloneNode())
            }
          }
        }
      } else {
        appendOriginalBG()
      }

      if (props.gridCoordinates && type == null) {
        for (const canvas of document.getElementsByClassName(
          'canvas-bg-' +
            props.gridCoordinates[0] +
            '-' +
            props.gridCoordinates[1]
        )) {
          const context: any = (canvas as HTMLCanvasElement).getContext('2d')
          context.drawImage(img, 0, 0, parentWidth, parentHeight)
        }
      }
    }

    if(!props.isOverlay && !_firstImageLoaded.current) {
      // console.log('firstImageLoaded')
      dispatch(setPlayerFirstImageLoaded({uuid: props.uuid, value: true}))
    }
  }

  const strobeImage = () => {
    const el = _contentRef.current
    const img = _image.current
    const scale = _scale.current || 1
    const appendOriginal = (
      image: HTMLIFrameElement | HTMLImageElement | HTMLVideoElement,
      contentRef: HTMLDivElement
    ) => {
      if (image) {
        contentRef.appendChild(image)
      }
      if (image instanceof HTMLVideoElement && image.paused) {
        image.play().catch((err) => console.warn(err))
      }
    }
    if (props.gridCoordinates) {
      for (const element of document.getElementsByClassName(
        'copy-' + props.gridCoordinates[0] + '-' + props.gridCoordinates[1]
      )) {
        if (el && img && img.src === props.image?.src) {
          if (element === el) {
            appendOriginal(img, el)
          } else {
            if (
              props.removeChild &&
              element.hasChildNodes() &&
              el.hasChildNodes()
            ) {
              element.removeChild(element.children.item(0) as Element)
            }
            if (img instanceof HTMLVideoElement) {
              if (_cloneGridVideoElements.current) {
                const clone = img.cloneNode() as HTMLVideoElement
                clone.volume = img.volume
                clone.currentTime = img.currentTime
                for (const attr of img.getAttributeNames()) {
                  clone.setAttribute(attr, img.getAttribute(attr) as string)
                }
                clone.play().catch((err) => console.warn(err))
                element.appendChild(clone)
              } else {
                const canvas = document.createElement('canvas')
                canvas.className =
                  'canvas-' +
                  props.gridCoordinates[0] +
                  '-' +
                  props.gridCoordinates[1]
                canvas.width = img.videoWidth * scale
                canvas.height = img.videoHeight * scale
                canvas.style.marginTop = img.style.marginTop
                canvas.style.marginLeft = img.style.marginLeft
                canvas.style.transform = img.style.transform
                canvas.style.transformOrigin = img.style.transformOrigin
                element.appendChild(canvas)
              }
            } else {
              element.appendChild(img.cloneNode())
            }
          }
        }
      }
    } else {
      if (el && img && img.src === props.image?.src) {
        appendOriginal(img, el)
      }
    }
  }

  if(_hasStarted.current === false && _prevHasStarted.current !== _hasStarted.current) {
    const el = _contentRef.current
    if (el?.firstChild && el.firstChild instanceof HTMLVideoElement) {
      const volume = el.firstChild.hasAttribute('volume')
        ? parseInt(el.firstChild.getAttribute('volume') as string)
        : _videoVolume.current
      el.firstChild.volume = volume / 100
    }
  }

  // START LOG COMPONENT CHANGES
  // const pr_uuid = useRef<string>()
  // const pr_isOverlay = useRef<boolean>()
  // const pr_image = useRef<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>()
  // const pr_fitParent = useRef<boolean>()
  // const pr_currentAudio = useRef<number>()
  // const pr_gridCoordinates = useRef<number[]>()
  // const pr_timeToNextFrame = useRef<number>()
  // const pr_toggleStrobe = useRef<boolean>()
  // const pr_pictureGrid = useRef<boolean>()
  // const pr_removeChild = useRef<boolean>()
  // const pr_className = useRef<string>()
  // const pr_onLoaded = useRef<() => void>()
  // const pr_setSceneCopy = useRef<(children: React.ReactNode) => void>()
  // const pr_setVideo = useRef<(video: HTMLVideoElement) => void>()
  // const p_hasStarted = useRef<boolean>()
  // const p_firstImageLoaded = useRef<boolean>()
  // const p_sceneID = useRef<number>()
  // const p_cloneGridVideoElements = useRef<boolean>()
  // const p_backgroundType = useRef<string>()
  // const p_backgroundColor = useRef<string>()
  // const p_backgroundColorSet = useRef<string[]>()
  // const p_backgroundBlur = useRef<number>()
  // const p_videoVolume = useRef<number>()
  // const p_crossFade = useRef<boolean>()
  // const p_crossFadeAudio = useRef<boolean>()
  // const p_slide = useRef<boolean>()
  // const p_imageOrientation = useRef<string>()
  // const p_videoOrientation = useRef<string>()
  // const p_imageType = useRef<string>()
  // const p_strobe = useRef<boolean>()
  // const p_strobeLayer = useRef<string>()
  // const p_strobePulse = useRef<boolean>()
  // const p_strobeDelayTF = useRef<string>()
  // const p_strobeTF = useRef<string>()
  // const p_zoom = useRef<boolean>()
  // const p_horizTransType = useRef<string>()
  // const p_vertTransType = useRef<string>()
  // const p_panning = useRef<boolean>()
  // const p_fadeInOut = useRef<boolean>()
  // const r_parentHeight = useRef<number>()
  // const r_parentWidth = useRef<number>()
  // const r_backgroundRef = useRef<HTMLDivElement>()
  // const r_contentRef = useRef<HTMLDivElement>()
  // const r_image = useRef<
  //   HTMLImageElement | HTMLVideoElement | HTMLIFrameElement
  // >()
  // const r_scale = useRef<number>()
  // const r_timeouts = useRef<number[]>([])

  // const r_prevBackgroundType = useRef<string>()
  // const r_prevHasStarted = useRef<boolean>()

  // console.log('44------------------------44')
  // if (props.uuid !== pr_uuid.current) {
  //   console.log('UUID PROP CHANGED')
  //   pr_uuid.current = props.uuid
  // }
  // if (props.isOverlay !== pr_isOverlay.current) {
  //   console.log('IS_OVERLAY PROP CHANGED')
  //   pr_isOverlay.current = props.isOverlay
  // }
  // if (props.image !== pr_image.current) {
  //   console.log('IMAGE PROP CHANGED')
  //   pr_image.current = props.image
  // }
  // if (props.fitParent !== pr_fitParent.current) {
  //   console.log('FIT_PARENT PROP CHANGED')
  //   pr_fitParent.current = props.fitParent
  // }
  // if (props.currentAudio !== pr_currentAudio.current) {
  //   console.log('CURRENT_AUDIO PROP CHANGED')
  //   pr_currentAudio.current = props.currentAudio
  // }
  // if (props.gridCoordinates !== pr_gridCoordinates.current) {
  //   console.log('GRID_COORDINATES PROP CHANGED')
  //   pr_gridCoordinates.current = props.gridCoordinates
  // }
  // if (props.timeToNextFrame !== pr_timeToNextFrame.current) {
  //   console.log('TIME_TO_NEXT_FRAME PROP CHANGED')
  //   pr_timeToNextFrame.current = props.timeToNextFrame
  // }
  // if (props.toggleStrobe !== pr_toggleStrobe.current) {
  //   console.log('TOGGLE_STROBE PROP CHANGED')
  //   pr_toggleStrobe.current = props.toggleStrobe
  // }
  // if (props.pictureGrid !== pr_pictureGrid.current) {
  //   console.log('PICTURE_GRID PROP CHANGED')
  //   pr_pictureGrid.current = props.pictureGrid
  // }
  // if (props.removeChild !== pr_removeChild.current) {
  //   console.log('REMOVE_CHILD PROP CHANGED')
  //   pr_removeChild.current = props.removeChild
  // }
  // if (props.className !== pr_className.current) {
  //   console.log('CLASS_NAME PROP CHANGED')
  //   pr_className.current = props.className
  // }
  // if (props.onLoaded !== pr_onLoaded.current) {
  //   console.log('ON_LOADED PROP CHANGED')
  //   pr_onLoaded.current = props.onLoaded
  // }
  // if (props.setSceneCopy !== pr_setSceneCopy.current) {
  //   console.log('SET_SCENE_COPY PROP CHANGED')
  //   pr_setSceneCopy.current = props.setSceneCopy
  // }
  // if (props.setVideo !== pr_setVideo.current) {
  //   console.log('SET_VIDEO PROP CHANGED')
  //   pr_setVideo.current = props.setVideo
  // }
  // if( p_hasStarted.current !== _hasStarted.current){
  //   console.log('HAS_STARTED CHANGED')
  //   p_hasStarted.current = _hasStarted.current
  // }
  // if( p_firstImageLoaded.current !== _firstImageLoaded.current){
  //   console.log('FIRST_IMAGE_LOADED CHANGED')
  //   p_firstImageLoaded.current = _firstImageLoaded.current
  // }
  // if( p_sceneID.current !== sceneID){
  //   console.log('SCENE_ID CHANGED')
  //   p_sceneID.current = sceneID
  // }
  // if( p_cloneGridVideoElements.current !== _cloneGridVideoElements.current){
  //   console.log('CLONE_GRID_VIDEO_ELEMENTS CHANGED')
  //   p_cloneGridVideoElements.current = _cloneGridVideoElements.current
  // }
  // if( p_backgroundType.current !== _backgroundType.current){
  //   console.log('BACKGROUND_TYPE CHANGED')
  //   p_backgroundType.current = _backgroundType.current
  // }
  // if( p_backgroundColor.current !== _backgroundColor.current){
  //   console.log('BACKGROUND_COLOR CHANGED')
  //   p_backgroundColor.current = _backgroundColor.current
  // }
  // if( p_backgroundColorSet.current !== _backgroundColorSet.current){
  //   console.log('BACKGROUND_COLOR_SET CHANGED')
  //   p_backgroundColorSet.current = _backgroundColorSet.current
  // }
  // if( p_backgroundBlur.current !== _backgroundBlur.current){
  //   console.log('BACKGROUND_BLUR CHANGED')
  //   p_backgroundBlur.current = _backgroundBlur.current
  // }
  // if( p_videoVolume.current !== _videoVolume.current){
  //   console.log('VIDEO_VOLUME CHANGED')
  //   p_videoVolume.current = _videoVolume.current
  // }
  // if( p_crossFade.current !== _crossFade.current){
  //   console.log('CROSS_FADE CHANGED')
  //   p_crossFade.current = _crossFade.current
  // }
  // if( p_crossFadeAudio.current !== _crossFadeAudio.current){
  //   console.log('CROSS_FADE_AUDIO CHANGED')
  //   p_crossFadeAudio.current = _crossFadeAudio.current
  // }
  // if( p_slide.current !== _slide.current){
  //   console.log('SLIDE CHANGED')
  //   p_slide.current = _slide.current
  // }
  // if( p_imageOrientation.current !== _imageOrientation.current){
  //   console.log('IMAGE_ORIENTATION CHANGED')
  //   p_imageOrientation.current = _imageOrientation.current
  // }
  // if( p_videoOrientation.current !== _videoOrientation.current){
  //   console.log('VIDEO_ORIENTATION CHANGED')
  //   p_videoOrientation.current = _videoOrientation.current
  // }
  // if( p_imageType.current !== _imageType.current){
  //   console.log('IMAGE_TYPE CHANGED')
  //   p_imageType.current = _imageType.current
  // }
  // if( p_strobe.current !== _strobe.current){
  //   console.log('STROBE CHANGED')
  //   p_strobe.current = _strobe.current
  // }
  // if( p_strobeLayer.current !== _strobeLayer.current){
  //   console.log('STROBE_LAYER CHANGED')
  //   p_strobeLayer.current = _strobeLayer.current
  // }
  // if( p_strobePulse.current !== _strobePulse.current) {
  //   console.log('STROBE_PULSE CHANGED')
  //   p_strobePulse.current = _strobePulse.current
  // }
  // if( p_strobeDelayTF.current !== _strobeDelayTF.current){
  //   console.log('STROBE_DELAY_TF CHANGED')
  //   p_strobeDelayTF.current = _strobeDelayTF.current
  // }
  // if( p_strobeTF.current !== _strobeTF.current){
  //   console.log('STROBE_TF CHANGED')
  //   p_strobeTF.current = _strobeTF.current
  // }
  // if( p_zoom.current !== _zoom.current){
  //   console.log('ZOOM CHANGED')
  //   p_zoom.current = _zoom.current
  // }
  // if( p_horizTransType.current !== _horizTransType.current){
  //   console.log('HORIZ_TRANS_TYPE CHANGED')
  //   p_horizTransType.current = _horizTransType.current
  // }
  // if( p_vertTransType.current !== _vertTransType.current){
  //   console.log('VERT_TRANS_TYPE CHANGED')
  //   p_vertTransType.current = _vertTransType.current
  // }
  // if( p_panning.current !== _panning.current){
  //   console.log('PANNING CHANGED')
  //   p_panning.current = _panning.current
  // }
  // if( p_fadeInOut.current !== _fadeInOut.current){
  //   console.log('FADE_IN_OUT CHANGED')
  //   p_fadeInOut.current = _fadeInOut.current
  // }
  // if(r_parentHeight.current !== _parentHeight.current){
  //   console.log('PARENT_HEIGHT CHANGED')
  //   r_parentHeight.current = _parentHeight.current
  // }
  // if(r_parentWidth.current !== _parentWidth.current){
  //   console.log('PARENT_WIDTH CHANGED')
  //   r_parentWidth.current = _parentWidth.current
  // }
  // if(r_backgroundRef.current !== _backgroundRef.current){
  //   console.log('BACKGROUND_REF CHANGED')
  //   r_backgroundRef.current = _backgroundRef.current
  // }
  // if(r_contentRef.current !== _contentRef.current){
  //   console.log('CONTENT_REF CHANGED')
  //   r_contentRef.current = _contentRef.current
  // }
  // if(r_image.current !== _image.current){
  //   console.log('IMAGE CHANGED')
  //   r_image.current = _image.current
  // }
  // if(r_scale.current !== _scale.current){
  //   console.log('SCALE CHANGED')
  //   r_scale.current = _scale.current
  // }
  // if(r_timeouts.current !== _timeouts.current){
  //   console.log('TIMEOUTS CHANGED')
  //   r_timeouts.current = _timeouts.current
  // }
  // if(r_prevBackgroundType.current !== _prevBackgroundType.current){
  //   console.log('PREV_BACKGROUND_TYPE CHANGED')
  //   r_prevBackgroundType.current = _prevBackgroundType.current
  // }
  // if(r_prevHasStarted.current !== _prevHasStarted.current){
  //   console.log('PREV_HAS_STARTED CHANGED')
  //   r_prevHasStarted.current = _prevHasStarted.current
  // }
  // console.log('44------------------------44')
  // END LOG COMPONENT CHANGES

  if (!props.image) {
    return (
      <div
        className={props.className}
        style={{
          zIndex: 2,
          margin: '-5px -10px -10px -5px',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'hidden'
        }}
      >
        <Box
          component="div"
          ref={_contentRef}
          style={{
            height: '100%',
            width: '100%',
            zIndex: 2,
            overflow: 'hidden',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            position: 'absolute'
          }}
        />
        <Box
          component="div"
          ref={_backgroundRef}
          style={{
            height: '100%',
            width: '100%',
            zIndex: 1,
            backgroundSize: 'cover',
            overflow: 'hidden'
          }}
        />
      </div>
    )
  } else if (props.pictureGrid) {
    return <animated.div className={props.className} ref={_contentRef} />
  }

  let backgroundStyle = {}
  if (_backgroundType.current === BT.color) {
    backgroundStyle = { backgroundColor: _backgroundColor.current }
  } else if (_backgroundType.current === BT.colorSet) {
    backgroundStyle = {
      backgroundColor: getRandomListItem(_backgroundColorSet.current)
    }
  } else if (_backgroundType.current === BT.colorRand) {
    backgroundStyle = {
      backgroundColor: getRandomColor()
    }
  } else if (_backgroundType.current === BT.blur) {
    backgroundStyle = {
      filter: 'blur(' + _backgroundBlur.current + 'px)'
    }
  }
  if (_slide.current) {
    backgroundStyle = {
      ...backgroundStyle,
      overflow: 'hidden'
    }
  }
  let viewDiv
  const imageClassName = props.gridCoordinates
    ? 'copy-' + props.gridCoordinates[0] + '-' + props.gridCoordinates[1]
    : undefined
  const backgroundClassName =
    !props.pictureGrid && _backgroundType.current === BT.blur && props.gridCoordinates
      ? 'copy-bg-' + props.gridCoordinates[0] + '-' + props.gridCoordinates[1]
      : undefined

  let imageDiv = (
    <animated.div
      id="image"
      className={imageClassName}
      ref={_contentRef}
      style={{
        height: '100%',
        width: '100%',
        zIndex: 2,
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        position: 'absolute'
      }}
    >
      <canvas ref={_canvas} width={750} height={750}/>
    </animated.div>
  )
  const backgroundDiv = (
    <animated.div
      ref={_backgroundRef}
      className={backgroundClassName}
      style={{
        height: '100%',
        width: '100%',
        zIndex: -1,
        position: 'absolute',
        backgroundSize: 'cover',
        ...backgroundStyle
      }}
    />
  )
  if (_strobe.current && _strobeLayer.current === SL.image) {
    if (_strobePulse.current ? _strobeDelayTF.current === TF.scene : _strobeTF.current === TF.scene) {
      imageDiv = (
        <StrobeImage
          sceneID={sceneID}
          timeToNextFrame={props.timeToNextFrame as number}
          currentAudio={props.currentAudio}
        >
          {imageDiv}
        </StrobeImage>
      )
    } else {
      imageDiv = (
        <Strobe
          sceneID={sceneID}
          currentAudio={props.currentAudio}
          zIndex={2}
          toggleStrobe={props.toggleStrobe}
          timeToNextFrame={props.timeToNextFrame}
          strobeFunction={strobeImage}
        >
          {imageDiv}
        </Strobe>
      )
    }
  }
  if (_zoom.current || _horizTransType.current !== HTF.none || _vertTransType.current !== VTF.none) {
    imageDiv = (
      <ZoomMove
        sceneID={sceneID}
        reset={!_panning.current && !_fadeInOut.current && !_slide.current && !_crossFade.current}
        timeToNextFrame={props.timeToNextFrame}
        currentAudio={props.currentAudio}
      >
        {imageDiv}
      </ZoomMove>
    )
  }
  if (_fadeInOut.current) {
    imageDiv = (
      <FadeInOut
        toggleFade={props.toggleStrobe}
        currentAudio={props.currentAudio}
        timeToNextFrame={props.timeToNextFrame}
        sceneID={sceneID}
        fadeFunction={strobeImage}
      >
        {imageDiv}
      </FadeInOut>
    )
  }
  if (_panning.current) {
    imageDiv = (
      <Panning
        image={props.image}
        parentHeight={
          _parentHeight.current
            ? _parentHeight.current
            : _contentRef.current?.parentElement.offsetHeight
        }
        parentWidth={
          _parentWidth.current
            ? _parentWidth.current
            : _contentRef.current.parentElement.offsetWidth
        }
        togglePan={props.toggleStrobe}
        currentAudio={props.currentAudio}
        timeToNextFrame={props.timeToNextFrame}
        sceneID={sceneID}
        panFunction={strobeImage}
      >
        {imageDiv}
      </Panning>
    )
  }
  viewDiv = (
    <React.Fragment>
      {imageDiv}
      {_strobe.current && _strobeLayer.current === SL.background && (
        <Strobe
          sceneID={sceneID}
          currentAudio={props.currentAudio}
          zIndex={1}
          toggleStrobe={props.toggleStrobe}
          timeToNextFrame={props.timeToNextFrame}
        />
      )}
      {backgroundDiv}
    </React.Fragment>
  )
  if (_crossFade.current) {
    viewDiv = (
      <CrossFade
        image={props.image}
        sceneID={sceneID}
        timeToNextFrame={props.timeToNextFrame}
        currentAudio={props.currentAudio}
      >
        {viewDiv}
      </CrossFade>
    )
  }
  if (_slide.current) {
    viewDiv = (
      <Slide
        image={props.image}
        sceneID={sceneID}
        timeToNextFrame={props.timeToNextFrame}
        currentAudio={props.currentAudio}
      >
        {viewDiv}
      </Slide>
    )
  }

  const renderDiv = (
    <animated.div
      style={{
        zIndex: 2,
        margin: '-5px -10px -10px -5px',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: 'hidden'
      }}
    >
      {viewDiv}
    </animated.div>
  )

  if (props.setSceneCopy) {
    // console.log('INVOKE SET_SCENE_COPY')
    setTimeout(() => {
      props.setSceneCopy(renderDiv)
    })
  }

  return renderDiv
}

;(ImageView as any).displayName = 'ImageView'
