import * as React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  Grid,
  Switch,
  Tooltip,
} from "@mui/material";

import { GeneralSettings } from "../../../common/Config";
import { onBoolInput } from "../../data/utils";

interface PlayerBoolCard2Props {
  generalSettings: GeneralSettings;
  onPortableOverride: () => void;
  onUpdateGeneralSettings: (update: Partial<GeneralSettings>) => void;
}

interface PlayerBoolCard2State {
  portableDialog: boolean;
}

export default class PlayerBoolCard2 extends React.Component<
  PlayerBoolCard2Props,
  PlayerBoolCard2State
> {
  constructor(props: PlayerBoolCard2Props) {
    super(props);

    this.state = {
      portableDialog: false,
    };
  }

  render() {
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title={
              <div>
                Prioritizing performance will smooth image effects, but may
                dramatically increase load times.
                <br />
                Prioritizing loading will decrease load times, but may result in
                jittery effects during playback
              </div>
            }
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.generalSettings.prioritizePerformance}
                  onChange={onBoolInput((prioritizePerformance) =>
                    this.update({ prioritizePerformance }),
                  )}
                />
              }
              label={
                this.props.generalSettings.prioritizePerformance
                  ? "Prioritize Performance"
                  : "Prioritize Loading"
              }
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="If disabled, no prompt will appear to confirm Scene deletion"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.generalSettings.confirmSceneDeletion}
                  onChange={onBoolInput((confirmSceneDeletion) =>
                    this.update({ confirmSceneDeletion }),
                  )}
                />
              }
              label="Confirm Scene Deletion"
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="If disabled, no prompt will appear to confirm blacklisting a file"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.generalSettings.confirmBlacklist}
                  onChange={onBoolInput((confirmBlacklist) =>
                    this.update({ confirmBlacklist }),
                  )}
                />
              }
              label="Confirm Blacklist"
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="If disabled, no prompt will appear to confirm File deletion"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.generalSettings.confirmFileDeletion}
                  onChange={onBoolInput((confirmFileDeletion) =>
                    this.update({ confirmFileDeletion }),
                  )}
                />
              }
              label="Confirm File Deletion"
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="Portable Mode will save a copy of your data in the same directory as the FlipFlip executable, as well as the default save path. This needs to be enabled on each machine."
          >
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.generalSettings.portableMode}
                  onChange={this.onTogglePortable}
                />
              }
              label="Portable Mode"
            />
          </Tooltip>
        </Grid>
        {this.props.generalSettings.portableMode && (
          <Grid item xs={12}>
            <Tooltip
              disableInteractive
              title="If on, data will only be saved in the same directory as the FlipFlip executable, and not at the default save path."
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={this.props.generalSettings.disableLocalSave}
                    onChange={onBoolInput((disableLocalSave) =>
                      this.update({ disableLocalSave }),
                    )}
                  />
                }
                label="Disable Local Saves"
              />
            </Tooltip>
          </Grid>
        )}
        <Dialog
          open={this.state.portableDialog}
          onClose={this.onToggleDialog}
          aria-describedby="portable-description"
        >
          <DialogContent>
            <DialogContentText id="portable-description">
              Do you want to use the local data on this machine or existing
              portable data?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onToggleDialog} color="secondary">
              Local data
            </Button>
            <Button onClick={this.onChoosePortable} color="primary">
              Portable data
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    );
  }

  onTogglePortable = (e: React.ChangeEvent<HTMLInputElement>) => {
    const portableMode = e.target.checked;
    if (portableMode) {
      window.ipc.portablePathExists().then((exists) => {
        if (exists) {
          // Ask whether to keep local or keep portable
          this.onToggleDialog();
        }
      });
    }
    this.update({ portableMode });
  };

  onToggleDialog = () => {
    this.setState({ portableDialog: !this.state.portableDialog });
  };

  onChoosePortable = () => {
    this.props.onPortableOverride();
    this.onToggleDialog();
  };

  update(update: Partial<GeneralSettings>) {
    this.props.onUpdateGeneralSettings(update);
  }
}

(PlayerBoolCard2 as any).displayName = "PlayerBoolCard2";
