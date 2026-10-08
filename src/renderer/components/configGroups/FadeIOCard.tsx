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
  Slider,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { EA, TF } from "../../../common/const";
import { SceneSettings } from "../../../common/Config";
import en from "../../../common/en";
import Scene from "../../../common/Scene";
import Audio from "../../../common/Audio";
import { styled } from "@mui/material/styles";

const FullWidthCollapse = styled(Collapse)(() => ({
  width: "100%",
}));
const FullWidthFormControl = styled(FormControl)(() => ({
  width: "100%",
}));

interface FadeIOCardProps {
  scene: Scene | SceneSettings;
  easingControls: boolean;
  sidebar?: boolean;
  tutorial?: string;
  onUpdateScene: (
    scene: Scene | SceneSettings,
    fn: (scene: Scene | SceneSettings) => void,
  ) => void;
}

interface FadeIOCardState {
  fadeIOSinRate: number;
}

class FadeIOCard extends React.Component<FadeIOCardProps, FadeIOCardState> {
  constructor(props: FadeIOCardProps) {
    super(props);

    const fadeIOSinRate =
      typeof this.props.scene.fadeIOSinRate === "number"
        ? this.props.scene.fadeIOSinRate
        : 0;
    this.state = {
      fadeIOSinRate,
    };
  }

  componentDidUpdate(props: FadeIOCardProps) {
    if (props.scene.fadeIOSinRate != this.props.scene.fadeIOSinRate) {
      const fadeIOSinRate =
        typeof this.props.scene.fadeIOSinRate === "number"
          ? this.props.scene.fadeIOSinRate
          : 0;

      this.setState({ fadeIOSinRate });
    }
  }

  render() {
    const fadeBPMMulti =
      typeof this.props.scene.fadeIOBPMMulti === "number"
        ? this.props.scene.fadeIOBPMMulti
        : 0;
    const fadeDuration =
      typeof this.props.scene.fadeIODuration === "number"
        ? this.props.scene.fadeIODuration
        : 0;
    const fadeDurationMin =
      typeof this.props.scene.fadeIODurationMin === "number"
        ? this.props.scene.fadeIODurationMin
        : 0;
    const fadeDurationMax =
      typeof this.props.scene.fadeIODurationMax === "number"
        ? this.props.scene.fadeIODurationMax
        : 0;

    const playlists = this.props.scene.audioPlaylists as {
      audios: Audio[];
      shuffle: boolean;
      repeat: string;
    }[];
    const hasBPM =
      !!playlists &&
      playlists.length &&
      playlists[0].audios.length &&
      playlists[0].audios[0].bpm;
    return (
      <Grid
        container
        spacing={this.props.scene.fadeInOut ? 2 : 0}
        alignItems="center"
        sx={{
          pointerEvents: this.props.tutorial != null ? "none" : undefined,
        }}
      >
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.scene.fadeInOut}
                onChange={(e) => this.onBoolInput("fadeInOut", e)}
              />
            }
            label="Fade In/Out"
          />
        </Grid>
        <Grid item xs={12}>
          <FullWidthCollapse in={this.props.scene.fadeInOut}>
            <Divider />
          </FullWidthCollapse>
        </Grid>
        <Grid item xs={12}>
          <FullWidthCollapse in={this.props.scene.fadeInOut}>
            <Grid container spacing={2} alignItems="center">
              <Grid
                item
                xs={12}
                sm={this.props.sidebar ? 12 : 4}
                sx={{ pt: 1.25 }}
              >
                <FullWidthFormControl variant="standard">
                  <InputLabel>Timing</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.fadeIOTF}
                    onChange={(e) => this.onInput("fadeIOTF", e)}
                  >
                    {Object.values(TF).map((tf) => {
                      if (tf == TF.bpm) {
                        return (
                          <MenuItem key={tf} value={tf}>
                            {en.get(tf)}{" "}
                            {!hasBPM && (
                              <Tooltip
                                disableInteractive
                                title="Missing audio with BPM"
                              >
                                <ErrorOutlineIcon color="error" />
                              </Tooltip>
                            )}
                          </MenuItem>
                        );
                      } else {
                        return (
                          <MenuItem key={tf} value={tf}>
                            {en.get(tf)}
                          </MenuItem>
                        );
                      }
                    })}
                  </Select>
                </FullWidthFormControl>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
                <FullWidthCollapse in={this.props.scene.fadeIOTF == TF.sin}>
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    Wave Rate
                  </Typography>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <Slider
                        min={1}
                        max={100}
                        value={this.state.fadeIOSinRate}
                        onChange={this.onFadeIOSinRateChange}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeIOSinRate", e, value)
                        }
                        valueLabelDisplay="auto"
                        aria-labelledby="fadeio-sin-rate-slider"
                      />
                    </Grid>
                    <Grid
                      item
                      xs={3}
                      sx={{ minWidth: (theme) => theme.spacing(11) }}
                    >
                      <TextField
                        variant="standard"
                        value={this.state.fadeIOSinRate}
                        onChange={(e) => this.onIntInput("fadeIOSinRate", e)}
                        onBlur={(e) => this.blurIntKey("fadeIOSinRate", e)}
                        InputProps={{
                          sx: {
                            pl: 1,
                            pt: 0,
                          },
                        }}
                        inputProps={{
                          step: 5,
                          min: 0,
                          max: 100,
                          type: "number",
                          "aria-labelledby": "fadeio-sin-rate-slider",
                        }}
                      />
                    </Grid>
                  </Grid>
                </FullWidthCollapse>
                <FullWidthCollapse in={this.props.scene.fadeIOTF == TF.bpm}>
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    BPM Multiplier {this.props.scene.fadeIOBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={fadeBPMMulti}
                    onChangeCommitted={(e, value) =>
                      this.onSliderChange("fadeIOBPMMulti", e, value)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => v / 10 + "x"}
                    aria-labelledby="fadeio-bpm-multi-slider"
                  />
                </FullWidthCollapse>
                <FullWidthCollapse
                  in={this.props.scene.fadeIOTF == TF.constant}
                >
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={fadeDuration}
                    onChange={(e) => this.onIntInput("fadeIODuration", e)}
                    onBlur={(e) => this.blurIntKey("fadeIODuration", e)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">ms</InputAdornment>
                      ),
                    }}
                    inputProps={{
                      step: 100,
                      min: 0,
                      type: "number",
                    }}
                  />
                </FullWidthCollapse>
              </Grid>
            </Grid>
          </FullWidthCollapse>
        </Grid>
        <Grid item xs={12}>
          <FullWidthCollapse
            in={
              this.props.scene.fadeInOut &&
              (this.props.scene.fadeIOTF == TF.random ||
                this.props.scene.fadeIOTF == TF.sin)
            }
          >
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={fadeDurationMin}
                  onChange={(e) => this.onIntInput("fadeIODurationMin", e)}
                  onBlur={(e) => this.blurIntKey("fadeIODurationMin", e)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">ms</InputAdornment>
                    ),
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: "number",
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="and"
                  margin="dense"
                  value={fadeDurationMax}
                  onChange={(e) => this.onIntInput("fadeIODurationMax", e)}
                  onBlur={(e) => this.blurIntKey("fadeIODurationMax", e)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">ms</InputAdornment>
                    ),
                  }}
                  inputProps={{
                    step: 100,
                    min: 0,
                    type: "number",
                  }}
                />
              </Grid>
            </Grid>
          </FullWidthCollapse>
        </Grid>
        {this.props.easingControls && (
          <React.Fragment>
            <Grid
              item
              xs={12}
              sx={{
                padding: !this.props.scene.fadeInOut ? 0 : undefined,
              }}
            >
              <FullWidthCollapse in={this.props.scene.fadeInOut}>
                <Divider />
              </FullWidthCollapse>
            </Grid>
            <Grid item xs={12}>
              <FullWidthCollapse in={this.props.scene.fadeInOut}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthFormControl variant="standard">
                      <InputLabel>Start Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.fadeIOStartEase}
                        onChange={(e) => this.onInput("fadeIOStartEase", e)}
                      >
                        {Object.values(EA).map((rf) => (
                          <MenuItem key={rf} value={rf}>
                            {en.get(rf)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FullWidthFormControl>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeIOStartEase == EA.polyIn ||
                        this.props.scene.fadeIOStartEase == EA.polyOut ||
                        this.props.scene.fadeIOStartEase == EA.polyInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Exponent: {this.props.scene.fadeIOStartExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.fadeIOStartExp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeIOStartExp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="start-exp-slider"
                      />
                    </FullWidthCollapse>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeIOStartEase == EA.backIn ||
                        this.props.scene.fadeIOStartEase == EA.backOut ||
                        this.props.scene.fadeIOStartEase == EA.backInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Overshoot: {this.props.scene.fadeIOStartOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.fadeIOStartOv}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeIOStartOv", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="start-ov-slider"
                      />
                    </FullWidthCollapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeIOStartEase == EA.elasticIn ||
                        this.props.scene.fadeIOStartEase == EA.elasticOut ||
                        this.props.scene.fadeIOStartEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Amplitude: {this.props.scene.fadeIOStartAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.fadeIOStartAmp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeIOStartAmp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 20}
                        aria-labelledby="start-amp-slider"
                      />
                    </FullWidthCollapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeIOStartEase == EA.elasticIn ||
                        this.props.scene.fadeIOStartEase == EA.elasticOut ||
                        this.props.scene.fadeIOStartEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Period: {this.props.scene.fadeIOStartPer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.fadeIOStartPer}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeIOStartPer", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 20}
                        aria-labelledby="start-per-slider"
                      />
                    </FullWidthCollapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthFormControl variant="standard">
                      <InputLabel>End Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.fadeIOEndEase}
                        onChange={(e) => this.onInput("fadeIOEndEase", e)}
                      >
                        {Object.values(EA).map((rf) => (
                          <MenuItem key={rf} value={rf}>
                            {en.get(rf)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FullWidthFormControl>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeIOEndEase == EA.polyIn ||
                        this.props.scene.fadeIOEndEase == EA.polyOut ||
                        this.props.scene.fadeIOEndEase == EA.polyInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Exponent: {this.props.scene.fadeIOEndExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.fadeIOEndExp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeIOEndExp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="end-exp-slider"
                      />
                    </FullWidthCollapse>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeIOEndEase == EA.backIn ||
                        this.props.scene.fadeIOEndEase == EA.backOut ||
                        this.props.scene.fadeIOEndEase == EA.backInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Overshoot: {this.props.scene.fadeIOEndOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.fadeIOEndOv}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeIOEndOv", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="end-ov-slider"
                      />
                    </FullWidthCollapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeIOEndEase == EA.elasticIn ||
                        this.props.scene.fadeIOEndEase == EA.elasticOut ||
                        this.props.scene.fadeIOEndEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Amplitude: {this.props.scene.fadeIOEndAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.fadeIOEndAmp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeIOEndAmp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 20}
                        aria-labelledby="end-amp-slider"
                      />
                    </FullWidthCollapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeIOEndEase == EA.elasticIn ||
                        this.props.scene.fadeIOEndEase == EA.elasticOut ||
                        this.props.scene.fadeIOEndEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Period: {this.props.scene.fadeIOEndPer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.fadeIOEndPer}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeIOEndPer", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 20}
                        aria-labelledby="end-per-slider"
                      />
                    </FullWidthCollapse>
                  </Grid>
                </Grid>
              </FullWidthCollapse>
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    );
  }

  blurIntKey = (
    key: string,
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { min, max } = e.currentTarget as HTMLInputElement;
    let value = e.currentTarget.value;
    if (min && (this.props.scene as any)[key] < Number(min)) {
      value = min;
      this.changeIntKey(key, min);
    } else if (max && (this.props.scene as any)[key] > Number(max)) {
      value = max;
      this.changeIntKey(key, max);
    }

    // Update fadeIOSinRate slider
    if (key == "fadeIOSinRate") {
      this.setState({ fadeIOSinRate: Number(value) });
    }
  };

  onFadeIOSinRateChange = (
    event: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ fadeIOSinRate: value as number });
  };

  onSliderChange = (
    key: string,
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.changeKey(key, value);
  };

  onBoolInput = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const checked = input.checked;
    this.changeKey(key, checked);
  };

  onIntInput = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const input = e.target;
    this.changeKey(key, input.value === "" ? "" : Number(input.value));
  };

  onInput = (key: string, e: SelectChangeEvent<string>) => {
    const input = e.target;
    this.changeKey(key, input.value);
  };

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeIntKey(key: string, intString: string) {
    this.changeKey(key, intString === "" ? "" : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => (s[key] = value));
  }
}

export default FadeIOCard;
