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

import { EA, SC, SL, TF } from "../../../common/const";
import en from "../../../common/en";
import Audio from "../../../common/Audio";
import ColorPicker from "../config/ColorPicker";
import ColorSetPicker from "../config/ColorSetPicker";
import { SceneBase } from "../../../common/SceneBase";
import { styled } from "@mui/material/styles";

const FullWidthCollapse = styled(Collapse)(() => ({
  width: "100%",
}));
const FullWidthPaddedCollapse = styled(FullWidthCollapse)(({ theme }) => ({
  [theme.breakpoints.up("sm")]: {
    paddingLeft: theme.spacing(1),
  },
}));
const FullWidthFormControl = styled(FormControl)(() => ({
  width: "100%",
}));
const PercentInputGrid = styled(Grid)(({ theme }) => ({
  minWidth: theme.spacing(11),
}));

interface StrobeCardProps<T extends SceneBase> {
  scene: T;
  easingControls: boolean;
  sidebar?: boolean;
  onUpdateScene: (scene: T, fn: (scene: T) => void) => void;
}

interface StrobeCardState {
  strobeSinRate: number;
  strobeDelaySinRate: number;
}

class StrobeCard<T extends SceneBase> extends React.Component<
  StrobeCardProps<T>,
  StrobeCardState
> {
  constructor(props: StrobeCardProps<T>) {
    super(props);

    const strobeSinRate =
      typeof this.props.scene.strobeSinRate === "number"
        ? this.props.scene.strobeSinRate
        : 0;

    const strobeDelaySinRate =
      typeof this.props.scene.strobeDelaySinRate === "number"
        ? this.props.scene.strobeDelaySinRate
        : 0;

    this.state = { strobeSinRate, strobeDelaySinRate };
  }

  componentDidUpdate(props: StrobeCardProps<T>) {
    if (props.scene.strobeSinRate != this.props.scene.strobeSinRate) {
      const strobeSinRate =
        typeof this.props.scene.strobeSinRate === "number"
          ? this.props.scene.strobeSinRate
          : 0;

      this.setState({ strobeSinRate });
    }
    if (props.scene.strobeDelaySinRate != this.props.scene.strobeDelaySinRate) {
      const strobeDelaySinRate =
        typeof this.props.scene.strobeDelaySinRate === "number"
          ? this.props.scene.strobeDelaySinRate
          : 0;

      this.setState({ strobeDelaySinRate });
    }
  }

  render() {
    const strobeOpacity =
      typeof this.props.scene.strobeOpacity === "number"
        ? this.props.scene.strobeOpacity
        : 0;
    const strobeBPMMulti =
      typeof this.props.scene.strobeBPMMulti === "number"
        ? this.props.scene.strobeBPMMulti
        : 0;
    const strobeTime =
      typeof this.props.scene.strobeTime === "number"
        ? this.props.scene.strobeTime
        : 0;
    const strobeTimeMin =
      typeof this.props.scene.strobeTimeMin === "number"
        ? this.props.scene.strobeTimeMin
        : 0;
    const strobeTimeMax =
      typeof this.props.scene.strobeTimeMax === "number"
        ? this.props.scene.strobeTimeMax
        : 0;
    const strobeDelayBPMMulti =
      typeof this.props.scene.strobeDelayBPMMulti === "number"
        ? this.props.scene.strobeDelayBPMMulti
        : 0;
    const strobeDelay =
      typeof this.props.scene.strobeDelay === "number"
        ? this.props.scene.strobeDelay
        : 0;
    const strobeDelayMin =
      typeof this.props.scene.strobeDelayMin === "number"
        ? this.props.scene.strobeDelayMin
        : 0;
    const strobeDelayMax =
      typeof this.props.scene.strobeDelayMax === "number"
        ? this.props.scene.strobeDelayMax
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
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.props.scene.strobe}
                    onChange={(e) => this.onBoolInput("strobe", e)}
                  />
                }
                label="Strobe"
              />
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 7}>
              <FullWidthPaddedCollapse in={this.props.scene.strobe}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.scene.strobePulse}
                      size="small"
                      onChange={(e) => this.onBoolInput("strobePulse", e)}
                    />
                  }
                  label="Add Delay"
                />
              </FullWidthPaddedCollapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            p:
              !this.props.scene.strobe ||
              this.props.scene.strobeLayer == SL.image
                ? "0 !important"
                : undefined,
          }}
        >
          <FullWidthCollapse
            in={
              this.props.scene.strobe &&
              this.props.scene.strobeLayer != SL.image
            }
          >
            <Grid container spacing={2} alignItems="center">
              <Grid
                item
                xs={12}
                sm={
                  !this.props.sidebar &&
                  this.props.scene.strobeLayer == SL.bottom
                    ? 4
                    : 12
                }
              >
                <FullWidthFormControl variant="standard">
                  <InputLabel>Color Type</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.strobeColorType}
                    onChange={(e) => this.onInput("strobeColorType", e)}
                  >
                    {Object.values(SC).map((sc) => (
                      <MenuItem key={sc} value={sc}>
                        {en.get(sc)}
                      </MenuItem>
                    ))}
                  </Select>
                </FullWidthFormControl>
              </Grid>
            </Grid>
          </FullWidthCollapse>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            p:
              !this.props.scene.strobe ||
              this.props.scene.strobeLayer == SL.image
                ? "0 !important"
                : undefined,
          }}
        >
          <FullWidthCollapse
            in={
              this.props.scene.strobe &&
              this.props.scene.strobeLayer != SL.image &&
              this.props.scene.strobeColorType != SC.colorRand
            }
          >
            {this.props.scene.strobe &&
              this.props.scene.strobeLayer != SL.image &&
              this.props.scene.strobeColorType == SC.color && (
                <ColorPicker
                  currentColor={this.props.scene.strobeColor}
                  onChangeColor={(color) =>
                    this.changeKey("strobeColor", color)
                  }
                />
              )}
            {this.props.scene.strobe &&
              this.props.scene.strobeLayer != SL.image &&
              this.props.scene.strobeColorType == SC.colorSet && (
                <ColorSetPicker
                  currentColors={this.props.scene.strobeColorSet}
                  onChangeColors={(colors) =>
                    this.changeKey("strobeColorSet", colors)
                  }
                />
              )}
          </FullWidthCollapse>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            p: !this.props.scene.strobe ? "0 !important" : undefined,
          }}
        >
          <FullWidthCollapse in={this.props.scene.strobe}>
            <Grid container spacing={2} alignItems="center">
              <Grid
                item
                xs={12}
                sm={
                  !this.props.sidebar &&
                  this.props.scene.strobeLayer == SL.bottom
                    ? 4
                    : 12
                }
              >
                <FullWidthFormControl variant="standard">
                  <InputLabel>Strobe Layer</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.strobeLayer}
                    onChange={(e) => this.onInput("strobeLayer", e)}
                  >
                    {Object.values(SL).map((sl) => (
                      <MenuItem key={sl} value={sl}>
                        {en.get(sl)}
                      </MenuItem>
                    ))}
                  </Select>
                </FullWidthFormControl>
              </Grid>
              <Grid
                item
                xs={12}
                sm={this.props.sidebar ? 12 : true}
                sx={{
                  p:
                    this.props.scene.strobeLayer != SL.bottom
                      ? "0 !important"
                      : undefined,
                }}
              >
                <FullWidthCollapse
                  in={this.props.scene.strobeLayer == SL.bottom}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    Strobe Opacity
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Slider
                        defaultValue={strobeOpacity * 100}
                        onChangeCommitted={(e, value) =>
                          this.onPercentSliderChange("strobeOpacity", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v + "%"}
                        aria-labelledby="strobe-opacity-slider"
                      />
                    </Grid>
                    <PercentInputGrid item xs={3}>
                      <TextField
                        variant="standard"
                        value={Math.round(strobeOpacity * 100)}
                        margin="dense"
                        onChange={(e) =>
                          this.onPercentIntInput("strobeOpacity", e)
                        }
                        onBlur={(e) =>
                          this.blurPercentIntKey("strobeOpacity", e)
                        }
                        InputProps={{
                          sx: {
                            pl: 1,
                            pt: 0,
                          },
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        }}
                        inputProps={{
                          step: 5,
                          min: 0,
                          max: 100,
                          type: "number",
                          "aria-labelledby": "strobe-opacity-slider",
                        }}
                      />
                    </PercentInputGrid>
                  </Grid>
                </FullWidthCollapse>
              </Grid>
            </Grid>
          </FullWidthCollapse>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            p: !this.props.scene.strobe ? "0 !important" : undefined,
          }}
        >
          <FullWidthCollapse in={this.props.scene.strobe}>
            <Divider />
          </FullWidthCollapse>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            p: !this.props.scene.strobe ? "0 !important" : undefined,
          }}
        >
          <FullWidthCollapse in={this.props.scene.strobe}>
            <Grid container spacing={2} alignItems="center">
              <Grid
                item
                xs={12}
                sm={this.props.sidebar ? 12 : 4}
                style={{ paddingTop: 10 }}
              >
                <FullWidthFormControl variant="standard">
                  <InputLabel>Timing</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.strobeTF}
                    onChange={(e) => this.onInput("strobeTF", e)}
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
                <FullWidthCollapse in={this.props.scene.strobeTF == TF.sin}>
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
                        value={this.state.strobeSinRate}
                        onChange={this.onStrobeSinRateChange}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("strobeSinRate", e, value)
                        }
                        valueLabelDisplay="auto"
                        aria-labelledby="strobe-sin-rate-slider"
                      />
                    </Grid>
                    <PercentInputGrid item xs={3}>
                      <TextField
                        variant="standard"
                        value={this.state.strobeSinRate}
                        onChange={(e) => this.onIntInput("strobeSinRate", e)}
                        onBlur={(e) => this.blurIntKey("strobeSinRate", e)}
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
                          "aria-labelledby": "strobe-sin-rate-slider",
                        }}
                      />
                    </PercentInputGrid>
                  </Grid>
                </FullWidthCollapse>
                <FullWidthCollapse in={this.props.scene.strobeTF == TF.bpm}>
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    BPM Multiplier {this.props.scene.strobeBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={strobeBPMMulti}
                    onChangeCommitted={(e, value) =>
                      this.onSliderChange("strobeBPMMulti", e, value)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => v / 10 + "x"}
                    aria-labelledby="strobe-bpm-multi-slider"
                  />
                </FullWidthCollapse>
                <FullWidthCollapse
                  in={this.props.scene.strobeTF == TF.constant}
                >
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={strobeTime}
                    onChange={(e) => this.onIntInput("strobeTime", e)}
                    onBlur={(e) => this.blurIntKey("strobeTime", e)}
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
            p: !this.props.scene.strobe ? "0 !important" : undefined,
          }}
        >
          <FullWidthCollapse
            in={
              this.props.scene.strobe &&
              (this.props.scene.strobeTF == TF.random ||
                this.props.scene.strobeTF == TF.sin)
            }
          >
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={strobeTimeMin}
                  onChange={(e) => this.onIntInput("strobeTimeMin", e)}
                  onBlur={(e) => this.blurIntKey("strobeTimeMin", e)}
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
                  value={strobeTimeMax}
                  onChange={(e) => this.onIntInput("strobeTimeMax", e)}
                  onBlur={(e) => this.blurIntKey("strobeTimeMax", e)}
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
        <Grid
          item
          xs={12}
          sx={{
            p:
              !this.props.scene.strobe || !this.props.scene.strobePulse
                ? "0 !important"
                : undefined,
          }}
        >
          <FullWidthCollapse
            in={this.props.scene.strobe && this.props.scene.strobePulse}
          >
            <Divider />
          </FullWidthCollapse>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            p:
              !this.props.scene.strobe || !this.props.scene.strobePulse
                ? "0 !important"
                : undefined,
          }}
        >
          <FullWidthCollapse
            in={this.props.scene.strobe && this.props.scene.strobePulse}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid
                item
                xs={12}
                sm={this.props.sidebar ? 12 : 4}
                style={{ paddingTop: 10 }}
              >
                <FullWidthFormControl variant="standard">
                  <InputLabel>Delay Timing</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.strobeDelayTF}
                    onChange={(e) => this.onInput("strobeDelayTF", e)}
                  >
                    {Object.values(TF).map((tf) => (
                      <MenuItem key={tf} value={tf}>
                        {en.get(tf)}
                      </MenuItem>
                    ))}
                  </Select>
                </FullWidthFormControl>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
                <FullWidthCollapse
                  in={this.props.scene.strobeDelayTF == TF.sin}
                >
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
                        value={this.state.strobeDelaySinRate}
                        onChange={this.onStrobeDelaySinRateChange}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("strobeDelaySinRate", e, value)
                        }
                        valueLabelDisplay="auto"
                        aria-labelledby="strobe-delay-sin-rate-slider"
                      />
                    </Grid>
                    <PercentInputGrid item xs={3}>
                      <TextField
                        variant="standard"
                        value={this.state.strobeDelaySinRate}
                        onChange={(e) =>
                          this.onIntInput("strobeDelaySinRate", e)
                        }
                        onBlur={(e) => this.blurIntKey("strobeDelaySinRate", e)}
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
                          "aria-labelledby": "strobe-delay-sin-rate-slider",
                        }}
                      />
                    </PercentInputGrid>
                  </Grid>
                </FullWidthCollapse>
                <FullWidthCollapse
                  in={this.props.scene.strobeDelayTF == TF.bpm}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    BPM Multiplier {this.props.scene.strobeDelayBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={strobeDelayBPMMulti}
                    onChangeCommitted={(e, value) =>
                      this.onSliderChange("strobeDelayBPMMulti", e, value)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => v / 10 + "x"}
                    aria-labelledby="strobe-delay-bpm-multi-slider"
                  />
                </FullWidthCollapse>
                <FullWidthCollapse
                  in={this.props.scene.strobeDelayTF == TF.constant}
                >
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={strobeDelay}
                    onChange={(e) => this.onIntInput("strobeDelay", e)}
                    onBlur={(e) => this.blurIntKey("strobeDelay", e)}
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
            p:
              !this.props.scene.strobe || !this.props.scene.strobePulse
                ? "0 !important"
                : undefined,
          }}
        >
          <FullWidthCollapse
            in={
              this.props.scene.strobe &&
              this.props.scene.strobePulse &&
              (this.props.scene.strobeDelayTF == TF.random ||
                this.props.scene.strobeDelayTF == TF.sin)
            }
          >
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={strobeDelayMin}
                  onChange={(e) => this.onIntInput("strobeDelayMin", e)}
                  onBlur={(e) => this.blurIntKey("strobeDelayMin", e)}
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
                  value={strobeDelayMax}
                  onChange={(e) => this.onIntInput("strobeDelayMax", e)}
                  onBlur={(e) => this.blurIntKey("strobeDelayMax", e)}
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
                p: !this.props.scene.strobe ? "0 !important" : undefined,
              }}
            >
              <FullWidthCollapse in={this.props.scene.strobe}>
                <Divider />
              </FullWidthCollapse>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                p: !this.props.scene.strobe ? "0 !important" : undefined,
              }}
            >
              <FullWidthCollapse in={this.props.scene.strobe}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthFormControl variant="standard">
                      <InputLabel>Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.strobeEase}
                        onChange={(e) => this.onInput("strobeEase", e)}
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
                        this.props.scene.strobeEase == EA.polyIn ||
                        this.props.scene.strobeEase == EA.polyOut ||
                        this.props.scene.strobeEase == EA.polyInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Exponent: {this.props.scene.strobeExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.strobeExp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("strobeExp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="exp-slider"
                      />
                    </FullWidthCollapse>
                    <FullWidthCollapse
                      in={
                        this.props.scene.strobeEase == EA.backIn ||
                        this.props.scene.strobeEase == EA.backOut ||
                        this.props.scene.strobeEase == EA.backInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Overshoot: {this.props.scene.strobeOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.strobeOv}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("strobeOv", e, value)
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
                        this.props.scene.strobeEase == EA.elasticIn ||
                        this.props.scene.strobeEase == EA.elasticOut ||
                        this.props.scene.strobeEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Amplitude: {this.props.scene.strobeAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.strobeAmp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("strobeAmp", e, value)
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
                        this.props.scene.strobeEase == EA.elasticIn ||
                        this.props.scene.strobeEase == EA.elasticOut ||
                        this.props.scene.strobeEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Period: {this.props.scene.strobePer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.strobePer}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("strobePer", e, value)
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

  blurPercentIntKey = (
    key: string,
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { min, max } = e.currentTarget as HTMLInputElement;
    if (min && (this.props.scene as any)[key] * 100 < Number(min)) {
      this.changeIntKey(key, min);
    } else if (max && (this.props.scene as any)[key] * 100 > Number(max)) {
      this.changeIntKey(key, max);
    }
  };

  onPercentSliderChange = (
    key: string,
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.changeKey(key, (value as number) / 100);
  };

  onPercentIntInput = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const input = e.target;
    this.changeKey(key, input.value === "" ? "" : Number(input.value) / 100);
  };

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

    // Update sliders
    if (key == "strobeSinRate") {
      this.setState({ strobeSinRate: Number(value) });
    } else if (key == "strobeDelaySinRate") {
      this.setState({ strobeDelaySinRate: Number(value) });
    }
  };

  onStrobeSinRateChange = (
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ strobeSinRate: value as number });
  };

  onStrobeDelaySinRateChange = (
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ strobeDelaySinRate: value as number });
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

export default StrobeCard;
