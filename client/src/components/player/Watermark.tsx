import { CSSProperties, useMemo } from 'react'
import {
  WC,
  WatermarkSettings,
  getFileName
} from 'flipflip-common'
import { useAppSelector } from '../../store/hooks'
import { selectImagePlayerShownImageView } from '../../store/imagePlayer/selectors'
import { ImageViewState } from '../../store/imagePlayer/slice'

function getWatermarkStyle(watermark: WatermarkSettings) {
  const watermarkStyle: CSSProperties = {
    position: 'absolute',
    zIndex: 11,
    whiteSpace: 'pre',
    fontFamily: watermark.watermarkFontFamily,
    fontSize: watermark.watermarkFontSize,
    color: watermark.watermarkColor
  }
  switch (watermark.watermarkCorner) {
    case WC.bottomRight:
      watermarkStyle.bottom = 5
      watermarkStyle.right = 5
      watermarkStyle.textAlign = 'right'
      break
    case WC.bottomLeft:
      watermarkStyle.bottom = 5
      watermarkStyle.left = 5
      watermarkStyle.textAlign = 'left'
      break
    case WC.topRight:
      watermarkStyle.top = 5
      watermarkStyle.right = 5
      watermarkStyle.textAlign = 'right'
      break
    case WC.topLeft:
      watermarkStyle.top = 5
      watermarkStyle.left = 5
      watermarkStyle.textAlign = 'left'
      break
  }

  return watermarkStyle
}

function getWatermarkText(
  watermark: WatermarkSettings,
  imageViewState?: ImageViewState
) {
  let watermarkText = watermark.watermarkText

  const sceneName = imageViewState?.scene?.name
  if (sceneName != null) {
    watermarkText = watermarkText.replace('{scene_name}', sceneName)
  } else {
    watermarkText = watermarkText.replace(/\s*\{scene_name\}\s*/g, '')
  }

  const url = imageViewState?.data?.url
  if (url != null) {
    watermarkText = watermarkText.replace('{file_url}', url)
    watermarkText = watermarkText.replace(
      '{file_name}',
      decodeURIComponent(getFileName(url, '/'))
    )
  } else {
    watermarkText = watermarkText.replace(/\s*\{file_url\}\s*/g, '')
    watermarkText = watermarkText.replace(/\s*\{file_name\}\s*/g, '')
  }

  const sourceUrl = imageViewState?.data?.sourceUrl
  if (sourceUrl != null) {
    watermarkText = watermarkText.replace('{source_url}', sourceUrl)
  } else {
    watermarkText = watermarkText.replace(/\s*\{source_url\}\s*/g, '')
  }

  const sourceName = imageViewState?.data?.sourceName
  if (sourceName != null) {
    watermarkText = watermarkText.replace('{source_name}', sourceName)
  } else {
    watermarkText = watermarkText.replace(/\s*\{source_name\}\s*/g, '')
  }

  const postUrl = imageViewState?.data?.postUrl
  if (postUrl != null) {
    watermarkText = watermarkText.replace('{post_url}', postUrl)
  } else {
    watermarkText = watermarkText.replace(/\s*\{post_url\}\s*/g, '')
  }

  // TODO add audio playback
  // if (this.state.currentAudio) {
  //   watermarkText = watermarkText.replace("{audio_url}", this.state.currentAudio.url);
  //   watermarkText = watermarkText.replace("{audio_name}", getFileName(this.state.currentAudio.url));
  //   if (this.state.currentAudio.name) {
  //     watermarkText = watermarkText.replace("{audio_title}", this.state.currentAudio.name);
  //   } else {
  //     watermarkText = watermarkText.replace(/\{audio_title\}\s*/g, "");
  //   }
  //   if (this.state.currentAudio.artist) {
  //     watermarkText = watermarkText.replace("{audio_artist}", this.state.currentAudio.artist);
  //   } else {
  //     watermarkText = watermarkText.replace(/\{audio_artist\}\s*/g, "");
  //   }
  //   if (this.state.currentAudio.album) {
  //     watermarkText = watermarkText.replace("{audio_album}", this.state.currentAudio.album);
  //   } else {
  //     watermarkText = watermarkText.replace(/\{audio_album\}\s*/g, "");
  //   }
  // } else {
  watermarkText = watermarkText.replace(/\s*\{audio_url\}\s*/g, '')
  watermarkText = watermarkText.replace(/\s*\{audio_name\}\s*/g, '')
  watermarkText = watermarkText.replace(/\s*\{audio_title\}\s*/g, '')
  watermarkText = watermarkText.replace(/\s*\{audio_artist\}\s*/g, '')
  watermarkText = watermarkText.replace(/\s*\{audio_album\}\s*/g, '')
  // }

  return watermarkText
}

export interface WatermarkProps {
  uuid: string
  watermark: WatermarkSettings
}

function Watermark({ uuid, watermark }: WatermarkProps) {
  const imageViewState = useAppSelector(selectImagePlayerShownImageView(uuid))
  const style = useMemo(() => getWatermarkStyle(watermark), [watermark])
  const text = getWatermarkText(watermark, imageViewState)
  return <div style={style}>{text}</div>
}

;(Watermark as any).displayName = 'Watermark'
export default Watermark
