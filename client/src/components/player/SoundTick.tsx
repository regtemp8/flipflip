import Sound from 'react-sound'

export interface SoundTickProps {
  url: string
  playing: any
  speed: number
  volume: number
  tick: boolean
  onPlaying: () => void
  onError: () => void
  onFinishedPlaying: () => void
}

export default function SoundTick(props: SoundTickProps) {
  return (
    <Sound
      url={props.url}
      playStatus={props.playing}
      playbackRate={props.speed}
      autoLoad
      loop={false}
      volume={props.volume}
      onPlaying={props.onPlaying}
      onError={props.onError}
      onFinishedPlaying={props.onFinishedPlaying}
      playFromPosition={props.tick ? 0 : 1}
    />
  )
}

;(SoundTick as any).displayName = 'SoundTick'
