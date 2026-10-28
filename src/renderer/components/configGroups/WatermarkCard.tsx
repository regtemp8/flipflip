import * as React from "react";

import {
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Theme,
  Tooltip,
} from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import { GeneralSettings } from "../../../common/Config";
import { WC } from "../../../common/const";
import en from "../../../common/en";
import ColorPicker from "../config/ColorPicker";
import {
  blurIntKey,
  intToText,
  onBoolInput,
  onInput,
  onIntInput,
  onTextInput,
} from "../../data/utils";

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: "100%",
    },
  });

interface WatermarkCardProps {
  classes: any;
  settings: GeneralSettings;
  onUpdateGeneralSettings: (update: Partial<GeneralSettings>) => void;
}

interface WatermarkCardState {
  systemFonts: Array<string>;
}

class WatermarkCard extends React.Component<
  WatermarkCardProps,
  WatermarkCardState
> {
  constructor(props: WatermarkCardProps) {
    super(props);

    this.state = {
      systemFonts: new Array<string>(),
    };
  }

  render() {
    const classes = this.props.classes;

    return (
      <Grid
        container
        spacing={this.props.settings.watermark ? 2 : 0}
        alignItems="center"
      >
        <Grid item xs={12}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Tooltip
                disableInteractive
                title={
                  <div>
                    When enabled, FlipFlip will display a watermark over each
                    Scene. You may use the following variables:
                    <br />
                    {"{scene_name}"} - Name of the current Scene
                    <br />
                    {"{source_url}"} - URL of the current Source
                    <br />
                    {"{source_name}"} - Name of the current Source
                    <br />
                    {"{post_url}"} - URL of the current file's post
                    <br />
                    {"{file_url}"} - URL of the current file
                    <br />
                    {"{file_name}"} - Name of the current file
                    <br />
                    {"{audio_url}"} - URL of the currently playing audio file
                    <br />
                    {"{audio_name}"} - Name of the currently playing audio file
                    <br />
                    {"{audio_title}"} - Title of the currently playing audio
                    file
                    <br />
                    {"{audio_artist}"} - Artist of the currently playing audio
                    file
                    <br />
                    {"{audio_album}"} - Album of the currently playing audio
                    file
                  </div>
                }
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.settings.watermark}
                      onChange={onBoolInput((watermark) =>
                        this.update({ watermark }),
                      )}
                    />
                  }
                  label="Enable Watermark"
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6}>
              {this.props.settings.watermark && (
                <Tooltip
                  disableInteractive
                  title="When enabled, watermark will display on Grid Scenes"
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.props.settings.watermarkGrid}
                        onChange={onBoolInput((watermarkGrid) =>
                          this.update({ watermarkGrid }),
                        )}
                      />
                    }
                    label="Show on Grids"
                  />
                </Tooltip>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Collapse
            in={this.props.settings.watermark}
            className={classes.fullWidth}
          >
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Collapse
            in={this.props.settings.watermark}
            className={classes.fullWidth}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Select
                  variant="standard"
                  value={this.props.settings.watermarkCorner}
                  onChange={onInput((watermarkCorner) =>
                    this.update({ watermarkCorner }),
                  )}
                >
                  {Object.values(WC).map((wc) => (
                    <MenuItem value={wc} key={wc}>
                      {en.get(wc)}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="standard"
                  fullWidth
                  multiline
                  label="Watermark Text"
                  value={this.props.settings.watermarkText}
                  margin="dense"
                  onChange={onTextInput((watermarkText) =>
                    this.update({ watermarkText }),
                  )}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Collapse
            in={this.props.settings.watermark}
            className={classes.fullWidth}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={9}>
                <FormControl variant="standard" className={classes.fullWidth}>
                  <InputLabel>Font</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.settings.watermarkFontFamily}
                    disabled={this.state.systemFonts.length == 0}
                    style={{
                      fontFamily: this.props.settings.watermarkFontFamily,
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                    onChange={onInput((watermarkFontFamily) =>
                      this.update({ watermarkFontFamily }),
                    )}
                  >
                    {this.state.systemFonts.map((f) => (
                      <MenuItem key={f} value={f} style={{ fontFamily: f }}>
                        {f}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  variant="standard"
                  label="Size"
                  margin="dense"
                  value={intToText(this.props.settings.watermarkFontSize)}
                  onChange={onIntInput((watermarkFontSize) =>
                    this.update({ watermarkFontSize }),
                  )}
                  onBlur={blurIntKey(
                    this.props.settings.watermarkFontSize,
                    (watermarkFontSize) => this.update({ watermarkFontSize }),
                  )}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">px</InputAdornment>
                    ),
                  }}
                  inputProps={{
                    min: 1,
                    type: "number",
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <ColorPicker
                  currentColor={this.props.settings.watermarkColor}
                  onChangeColor={(watermarkColor) =>
                    this.update({ watermarkColor })
                  }
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    );
  }

  _abortController: AbortController = new AbortController();
  componentDidMount() {
    // Define system fonts
    window.ipc.getFonts().then(
      (res: Array<string>) => {
        if (!this._abortController.signal.aborted) {
          this.setState({ systemFonts: res });
        }
      },
      (err: string) => {
        console.error(err);
      },
    );
  }

  componentWillUnmount() {
    this._abortController.abort();
  }

  update(update: Partial<GeneralSettings>) {
    this.props.onUpdateGeneralSettings(update);
  }
}

(WatermarkCard as any).displayName = "WatermarkCard";
export default withStyles(styles)(WatermarkCard);
