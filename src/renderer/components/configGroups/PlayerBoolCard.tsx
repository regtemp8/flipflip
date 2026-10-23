import * as React from "react";

import {
  Collapse,
  FormControlLabel,
  Grid,
  Switch,
  Tooltip,
} from "@mui/material";

import { DisplaySettings } from "../../../common/Config";

interface PlayerBoolCardProps {
  displaySettings: DisplaySettings;
  onUpdateDisplaySettings: (fn: (settings: DisplaySettings) => void) => void;
}

export default class PlayerBoolCard extends React.Component<PlayerBoolCardProps> {
  constructor(props: PlayerBoolCardProps) {
    super(props);
  }

  render() {
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.displaySettings.alwaysOnTop}
                onChange={(e) => this.onBoolInput("alwaysOnTop", e)}
              />
            }
            label="Always On Top"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.displaySettings.showMenu}
                onChange={(e) => this.onBoolInput("showMenu", e)}
              />
            }
            label="Show Menu"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.displaySettings.fullScreen}
                onChange={(e) => this.onBoolInput("fullScreen", e)}
              />
            }
            label="Fullscreen"
          />
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="If enabled, the player will start as soon as first image loads. If disabled, the player will load the first set of images from all sources before starting."
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.displaySettings.startImmediately}
                  onChange={(e) => this.onBoolInput("startImmediately", e)}
                />
              }
              label="Start Immediately"
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="If enabled, clicking the currently playing image will advance to the next image."
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.displaySettings.clickToProgress}
                  onChange={(e) => this.onBoolInput("clickToProgress", e)}
                />
              }
              label="Click to Progress"
            />
          </Tooltip>
        </Grid>
        <Grid
          item
          xs={12}
          style={
            this.props.displaySettings.clickToProgress
              ? { paddingLeft: 40 }
              : { padding: 0 }
          }
        >
          <Collapse in={this.props.displaySettings.clickToProgress}>
            <Tooltip
              disableInteractive
              title="If enabled, clicking will advance even during Scene playback. If disabled, clicking will only advance while Scene playback is paused."
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      this.props.displaySettings.clickToProgressWhilePlaying
                    }
                    onChange={(e) =>
                      this.onBoolInput("clickToProgressWhilePlaying", e)
                    }
                    size="small"
                  />
                }
                label="While Playing"
              />
            </Tooltip>
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="If enabled, additional controls for controlling 'easing' will be available in the Effect section."
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.displaySettings.easingControls}
                  onChange={(e) => this.onBoolInput("easingControls", e)}
                />
              }
              label="Show Adv Easing Controls"
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="If enabled, track information will appear during playback whenever a new audio track starts."
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.displaySettings.audioAlert}
                  onChange={(e) => this.onBoolInput("audioAlert", e)}
                />
              }
              label="Show Audio Info"
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="If enabled, cloned/mirrored grid cells will use a copy of the actual video file, instead of a canvas. This may improve video framerate, but will remove absolute synchronization"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.displaySettings.cloneGridVideoElements}
                  onChange={(e) =>
                    this.onBoolInput("cloneGridVideoElements", e)
                  }
                />
              }
              label="Clone Grid Videos Directly"
            />
          </Tooltip>
        </Grid>
      </Grid>
    );
  }

  onBoolInput = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const checked = input.checked;
    this.changeKey(key, checked);
  };

  changeKey(key: string, value: any) {
    this.update((s) => (s[key] = value));
  }

  update(fn: (settings: any) => void) {
    this.props.onUpdateDisplaySettings(fn);
  }
}

(PlayerBoolCard as any).displayName = "PlayerBoolCard";
