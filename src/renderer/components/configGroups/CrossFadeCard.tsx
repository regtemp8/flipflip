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

import { EA, SDT, TF } from "../../../common/const";
import en from "../../../common/en";
import { styled } from "@mui/material/styles";
import { SceneBase } from "../../../common/SceneBase";

const FullWidthCollapse = styled(Collapse)(() => ({
  width: "100%",
}));
const FullWidthFormControl = styled(FormControl)(() => ({
  width: "100%",
}));

interface CrossFadeCardProps<T extends SceneBase> {
  scene: T;
  easingControls: boolean;
  sidebar?: boolean;
  tutorial?: string;
  onUpdateScene: (scene: T, fn: (scene: T) => void) => void;
}

interface CrossFadeCardState {
  fadeSinRate: number;
}

class CrossFadeCard<T extends SceneBase> extends React.Component<
  CrossFadeCardProps<T>,
  CrossFadeCardState
> {
  constructor(props: CrossFadeCardProps<T>) {
    super(props);

    this.state = {
      fadeSinRate:
        typeof this.props.scene.fadeSinRate === "number"
          ? this.props.scene.fadeSinRate
          : 0,
    };
  }

  componentDidUpdate(props: CrossFadeCardProps<T>) {
    if (props.scene.fadeSinRate != this.props.scene.fadeSinRate) {
      this.setState({
        fadeSinRate:
          typeof this.props.scene.fadeSinRate === "number"
            ? this.props.scene.fadeSinRate
            : 0,
      });
    }
  }

  render() {
    const fadeBPMMulti =
      typeof this.props.scene.fadeBPMMulti === "number"
        ? this.props.scene.fadeBPMMulti
        : 0;
    const fadeDuration =
      typeof this.props.scene.fadeDuration === "number"
        ? this.props.scene.fadeDuration
        : 0;
    const fadeDurationMin =
      typeof this.props.scene.fadeDurationMin === "number"
        ? this.props.scene.fadeDurationMin
        : 0;
    const fadeDurationMax =
      typeof this.props.scene.fadeDurationMax === "number"
        ? this.props.scene.fadeDurationMax
        : 0;

    const playlists = this.props.scene.audioPlaylists;
    const hasBPM =
      !!playlists &&
      playlists.length &&
      playlists[0].audios.length &&
      playlists[0].audios[0].bpm;

    return (
      <Grid
        container
        spacing={this.props.scene.crossFade ? 2 : 0}
        alignItems="center"
      >
        <Grid
          item
          xs={12}
          sx={{
            pointerEvents:
              this.props.tutorial != null && this.props.tutorial != SDT.fade1
                ? "none"
                : undefined,
          }}
        >
          <Grid container alignItems="center">
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 5}>
              <FormControlLabel
                sx={{
                  borderWidth: this.props.tutorial == SDT.fade1 ? 2 : 0,
                  borderColor: "secondary.main",
                  borderStyle: "solid",
                }}
                control={
                  <Switch
                    checked={this.props.scene.crossFade}
                    onChange={(e) => this.onBoolInput("crossFade", e)}
                  />
                }
                label="Cross-Fade"
              />
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 7}>
              <FullWidthCollapse
                in={this.props.scene.crossFade}
                sx={{ pl: { xs: 1, sm: 0 } }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.scene.crossFadeAudio}
                      size="small"
                      onChange={(e) => this.onBoolInput("crossFadeAudio", e)}
                    />
                  }
                  label="Cross-Fade Audio"
                />
              </FullWidthCollapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <FullWidthCollapse in={this.props.scene.crossFade}>
            <Divider />
          </FullWidthCollapse>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            ...{
              pointerEvents: this.props.tutorial != null ? "none" : undefined,
            },
            ...{
              borderWidth: this.props.tutorial == SDT.fade2 ? 2 : 0,
              borderColor: "secondary.main",
              borderStyle: "solid",
            },
          }}
        >
          <FullWidthCollapse in={this.props.scene.crossFade}>
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
                    value={this.props.scene.fadeTF}
                    onChange={(e) => this.onInput("fadeTF", e)}
                  >
                    {Object.values(TF).map((tf) => {
                      if (tf === TF.bpm) {
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
                <FullWidthCollapse in={this.props.scene.fadeTF === TF.sin}>
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
                        value={this.state.fadeSinRate}
                        onChange={this.onFadeSinRateChange}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeSinRate", e, value)
                        }
                        valueLabelDisplay="auto"
                        aria-labelledby="fade-sin-rate-slider"
                      />
                    </Grid>
                    <Grid
                      item
                      xs={3}
                      sx={{ minWidth: (theme) => theme.spacing(11) }}
                    >
                      <TextField
                        variant="standard"
                        value={this.state.fadeSinRate}
                        onChange={(e) => this.onIntInput("fadeSinRate", e)}
                        onBlur={(e) => this.blurIntKey("fadeSinRate", e)}
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
                          "aria-labelledby": "fade-sin-rate-slider",
                        }}
                      />
                    </Grid>
                  </Grid>
                </FullWidthCollapse>
                <FullWidthCollapse in={this.props.scene.fadeTF === TF.bpm}>
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    BPM Multiplier {this.props.scene.fadeBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={fadeBPMMulti}
                    onChangeCommitted={(e, value) =>
                      this.onSliderChange("fadeBPMMulti", e, value)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => v / 10 + "x"}
                    aria-labelledby="fade-bpm-multi-slider"
                  />
                </FullWidthCollapse>
                <FullWidthCollapse in={this.props.scene.fadeTF === TF.constant}>
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={fadeDuration}
                    onChange={(e) => this.onIntInput("fadeDuration", e)}
                    onBlur={(e) => this.blurIntKey("fadeDuration", e)}
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
        <Grid
          item
          xs={12}
          sx={{
            pointerEvents: this.props.tutorial != null ? "none" : undefined,
          }}
        >
          <FullWidthCollapse
            in={
              this.props.scene.crossFade &&
              (this.props.scene.fadeTF === TF.random ||
                this.props.scene.fadeTF === TF.sin)
            }
          >
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={fadeDurationMin}
                  onChange={(e) => this.onIntInput("fadeDurationMin", e)}
                  onBlur={(e) => this.blurIntKey("fadeDurationMin", e)}
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
                  onChange={(e) => this.onIntInput("fadeDurationMax", e)}
                  onBlur={(e) => this.blurIntKey("fadeDurationMax", e)}
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
                p: !this.props.scene.crossFade ? 0 : undefined,
              }}
            >
              <FullWidthCollapse in={this.props.scene.crossFade}>
                <Divider />
              </FullWidthCollapse>
            </Grid>
            <Grid item xs={12}>
              <FullWidthCollapse in={this.props.scene.crossFade}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthFormControl variant="standard">
                      <InputLabel>Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.fadeEase}
                        onChange={(e) => this.onInput("fadeEase", e)}
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
                        this.props.scene.fadeEase === EA.polyIn ||
                        this.props.scene.fadeEase === EA.polyOut ||
                        this.props.scene.fadeEase === EA.polyInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Exponent: {this.props.scene.fadeExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.fadeExp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeExp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="exp-slider"
                      />
                    </FullWidthCollapse>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeEase === EA.backIn ||
                        this.props.scene.fadeEase === EA.backOut ||
                        this.props.scene.fadeEase === EA.backInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Overshoot: {this.props.scene.fadeOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.fadeOv}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeOv", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="ov-slider"
                      />
                    </FullWidthCollapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeEase === EA.elasticIn ||
                        this.props.scene.fadeEase === EA.elasticOut ||
                        this.props.scene.fadeEase === EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Amplitude: {this.props.scene.fadeAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.fadeAmp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadeAmp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 20}
                        aria-labelledby="amp-slider"
                      />
                    </FullWidthCollapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthCollapse
                      in={
                        this.props.scene.fadeEase === EA.elasticIn ||
                        this.props.scene.fadeEase === EA.elasticOut ||
                        this.props.scene.fadeEase === EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Period: {this.props.scene.fadePer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.fadePer}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("fadePer", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 20}
                        aria-labelledby="per-slider"
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

    // Update fadeSinRate slider
    if (key == "fadeSinRate") {
      this.setState({ fadeSinRate: Number(value) });
    }
  };

  onFadeSinRateChange = (
    event: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ fadeSinRate: value as number });
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

export default CrossFadeCard;
