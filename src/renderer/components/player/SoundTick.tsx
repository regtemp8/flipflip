import Sound from 'react-sound'

export interface SoundTickProps {
  url: string
  playing: any
  speed: number
  volume: number
  tick: boolean
  onPlaying: (soundData: any) => void
  onError: (errorCode: number, description: string) => void
  onFinishedPlaying: () => void
}

export default function SoundTick (props: SoundTickProps) {
  return (
    <Sound
      url={props.url}
      playStatus={props.playing}
      playbackRate={props.speed}
      autoLoad
      loop={false}
      volume={props.volume}
      onPlaying={props.onPlaying.bind(this)}
      onError={props.onError.bind(this)}
      onFinishedPlaying={props.onFinishedPlaying.bind(this)}
      playFromPosition={props.tick ? 0 : 1}
    />
  )
}

;(SoundTick as any).displayName = 'SoundTick'
