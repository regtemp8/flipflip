import * as React from "react";
import Sound from "react-sound";
import { proxyAudio } from "../../../common/utils";
interface SoundTickProps {
  url: string;
  playing: any;
  speed: number;
  volume: number;
  tick: boolean;
  onPlaying: (soundData: { position: number; duration: number }) => void;
  onError: (errorCode: number, description: string) => void;
  onFinishedPlaying: () => void;
}

export default class SoundTick extends React.Component<SoundTickProps> {
  constructor(props: SoundTickProps) {
    super(props);
  }

  shouldComponentUpdate(props: SoundTickProps) {
    return this.props.tick !== props.tick;
  }

  render() {
    return (
      <Sound
        url={proxyAudio(this.props.url)}
        playStatus={this.props.playing}
        playbackRate={this.props.speed}
        autoLoad
        loop={false}
        volume={this.props.volume}
        onPlaying={this.props.onPlaying}
        onError={this.props.onError}
        onFinishedPlaying={this.props.onFinishedPlaying}
        playFromPosition={this.props.tick ? 0 : 1}
      />
    );
  }
}

(SoundTick as any).displayName = "SoundTick";
