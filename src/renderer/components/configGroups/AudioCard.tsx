import * as React from "react";

import {
  Card,
  CardContent,
  Collapse,
  Fab,
  FormControlLabel,
  Grid,
  Switch,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { RP } from "../../../common/const";
import Scene from "../../../common/Scene";
import Audio from "../../../common/Audio";
import AudioPlaylist from "../player/AudioPlaylist";
import AudioOptions from "../library/AudioOptions";

interface AudioCardProps {
  scene: Scene;
  sidebar?: boolean;
  startPlaying: boolean;
  persist?: boolean;
  shorterSeek?: boolean;
  showMsTimestamp?: boolean;
  scenePaths?: Array<any>;
  onUpdateScene: (scene: Scene, fn: (scene: Scene) => void) => void;
  goBack?: () => void;
  onAddTracks?: (playlistIndex: number) => void;
  onPlay?: (source: Audio, displayed: Array<Audio>) => void;
  onPlaying?: (position: number, duration: number) => void;
  orderAudioTags?: (audio: Audio) => void;
  playTrack?: (url: string) => void;
  playNextScene?: () => void;
  setCurrentAudio?: (audio: Audio) => void;
  systemMessage?: (message: string) => void;
}

interface AudioCardState {
  sourceOptionsPlaylist: number;
  sourceOptions?: Audio;
}

class AudioCard extends React.Component<AudioCardProps, AudioCardState> {
  constructor(props: AudioCardProps) {
    super(props);

    this.state = {
      sourceOptionsPlaylist: -1,
    };
  }

  render() {
    return (
      <Grid
        container
        alignItems="center"
        spacing={this.props.scene.audioEnabled ? 2 : 0}
      >
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Collapse in={!this.props.persist}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.scene.audioEnabled}
                      onChange={(e) => this.onBoolInput("audioEnabled", e)}
                    />
                  }
                  label="Audio Playlists"
                />
              </Collapse>
            </Grid>
            <Grid item>
              <Collapse
                in={this.props.scene.audioEnabled && !this.props.startPlaying}
              >
                <Tooltip disableInteractive title="Add Playlist">
                  <Fab
                    sx={{ boxShadow: "none" }}
                    onClick={this.onAddPlaylist}
                    size="small"
                  >
                    <AddIcon />
                  </Fab>
                </Tooltip>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        {this.props.scene.audioPlaylists.map((playlist, i) => (
          <Grid key={i} item xs={12}>
            <Collapse in={this.props.scene.audioEnabled || this.props.persist}>
              <Card>
                <CardContent>
                  <AudioPlaylist
                    playlistIndex={i}
                    playlist={playlist}
                    scene={this.props.scene}
                    scenePaths={this.props.scenePaths}
                    shorterSeek={this.props.shorterSeek}
                    showMsTimestamp={this.props.showMsTimestamp}
                    sidebar={this.props.sidebar}
                    startPlaying={this.props.startPlaying}
                    persist={this.props.persist}
                    onAddTracks={this.props.onAddTracks}
                    onSourceOptions={this.onSourceOptions}
                    onUpdateScene={this.props.onUpdateScene}
                    setCurrentAudio={
                      i == 0 ? this.props.setCurrentAudio : undefined
                    }
                    goBack={this.props.goBack}
                    onPlay={this.props.onPlay}
                    onPlaying={this.props.onPlaying}
                    orderAudioTags={this.props.orderAudioTags}
                    playTrack={this.props.playTrack}
                    playNextScene={this.props.playNextScene}
                    systemMessage={this.props.systemMessage}
                  />
                </CardContent>
              </Card>
            </Collapse>
          </Grid>
        ))}
        {this.state.sourceOptions != null && (
          <AudioOptions
            audio={this.state.sourceOptions}
            onCancel={this.onCloseSourceOptions}
            onFinishEdit={this.onFinishSourceOptions}
          />
        )}
      </Grid>
    );
  }

  onFinishSourceOptions = (newAudio: Audio) => {
    const { sourceOptions, sourceOptionsPlaylist } = this.state;
    this.props.onUpdateScene(this.props.scene, (s) => {
      const playlist = s.audioPlaylists[sourceOptionsPlaylist];
      const editSource = playlist.audios.find((a) => a.id == sourceOptions.id);
      if (editSource != null) {
        Object.assign(editSource, newAudio);
      }
    });
    this.onCloseSourceOptions();
  };

  onCloseSourceOptions = () => {
    this.setState({ sourceOptions: undefined, sourceOptionsPlaylist: -1 });
  };

  onSourceOptions = (playlistIndex: number, audio: Audio) => {
    this.setState({
      sourceOptions: audio,
      sourceOptionsPlaylist: playlistIndex,
    });
  };

  onAddPlaylist = () => {
    this.changeKey(
      "audioPlaylists",
      this.props.scene.audioPlaylists.concat([
        { audios: [], shuffle: false, repeat: RP.all },
      ]),
    );
  };

  onBoolInput = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const checked = input.checked;
    this.changeKey(key, checked);
  };

  changeKey(key: string, value: any) {
    this.update((s) => (s[key] = value));
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }
}

export default AudioCard;
