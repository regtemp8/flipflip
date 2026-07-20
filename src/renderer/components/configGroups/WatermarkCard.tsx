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
  SelectChangeEvent,
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

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: "100%",
    },
  });

interface WatermarkCardProps {
  classes: any;
  settings: GeneralSettings;
  onUpdateSettings(fn: (settings: GeneralSettings) => void): void;
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
                      onChange={this.onBoolInput.bind(this, "watermark")}
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
                        onChange={this.onBoolInput.bind(this, "watermarkGrid")}
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
                  onChange={this.onInput.bind(this, "watermarkCorner")}
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
                  onChange={this.onTextInput.bind(this, "watermarkText")}
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
                    onChange={this.onInput.bind(this, "watermarkFontFamily")}
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
                  value={this.props.settings.watermarkFontSize}
                  onChange={this.onIntInput.bind(this, "watermarkFontSize")}
                  onBlur={this.blurIntKey.bind(this, "watermarkFontSize")}
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
                  onChangeColor={this.onInput.bind(this, "watermarkColor")}
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

  onInput(key: string, e: SelectChangeEvent<string>) {
    const input = e.target;
    this.changeKey(key, input.value);
  }

  onTextInput(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    this.changeKey(key, input.value);
  }

  onIntInput(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    this.changeKey(key, input.value === "" ? "" : Number(input.value));
  }

  blurIntKey(key: string, e: React.FocusEvent<HTMLInputElement>) {
    const { min, max } = e.currentTarget;
    if (min && (this.props.settings as any)[key] < Number(min)) {
      this.changeIntKey(key, min);
    } else if (max && (this.props.settings as any)[key] > Number(max)) {
      this.changeIntKey(key, max);
    }
  }

  changeIntKey(key: string, intString: string) {
    this.changeKey(key, intString === "" ? "" : Number(intString));
  }

  onBoolInput(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  changeKey(key: string, value: any) {
    this.update((s) => (s[key] = value));
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateSettings(fn);
  }
}

(WatermarkCard as any).displayName = "WatermarkCard";
export default withStyles(styles)(WatermarkCard as any);
