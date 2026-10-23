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

import { EA, HTF, TF, VTF } from "../../../common/const";
import en from "../../../common/en";
import Audio from "../../../common/Audio";
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

interface PanningCardProps<T extends SceneBase> {
  scene: T;
  sidebar?: boolean;
  easingControls: boolean;
  tutorial?: string;
  onUpdateScene: (scene: T, fn: (scene: T) => void) => void;
}

interface PanningCardState {
  panHorizTransLevel: number;
  panVertTransLevel: number;
  panSinRate: number;
}

class PanningCard<T extends SceneBase> extends React.Component<
  PanningCardProps<T>,
  PanningCardState
> {
  constructor(props: PanningCardProps<T>) {
    super(props);

    const panHorizTransLevel =
      typeof this.props.scene.panHorizTransLevel === "number"
        ? this.props.scene.panHorizTransLevel
        : 0;

    const panVertTransLevel =
      typeof this.props.scene.panVertTransLevel === "number"
        ? this.props.scene.panVertTransLevel
        : 0;

    const panSinRate =
      typeof this.props.scene.panSinRate === "number"
        ? this.props.scene.panSinRate
        : 0;

    this.state = {
      panHorizTransLevel,
      panVertTransLevel,
      panSinRate,
    };
  }

  componentDidUpdate(props: PanningCardProps<T>) {
    if (props.scene.panHorizTransLevel != this.props.scene.panHorizTransLevel) {
      const panHorizTransLevel =
        typeof this.props.scene.panHorizTransLevel === "number"
          ? this.props.scene.panHorizTransLevel
          : 0;

      this.setState({ panHorizTransLevel });
    }
    if (props.scene.panVertTransLevel != this.props.scene.panVertTransLevel) {
      const panVertTransLevel =
        typeof this.props.scene.panVertTransLevel === "number"
          ? this.props.scene.panVertTransLevel
          : 0;

      this.setState({ panVertTransLevel });
    }
    if (props.scene.panSinRate != this.props.scene.panSinRate) {
      const panSinRate =
        typeof this.props.scene.panSinRate === "number"
          ? this.props.scene.panSinRate
          : 0;

      this.setState({ panSinRate });
    }
  }

  render() {
    const panBPMMulti =
      typeof this.props.scene.panBPMMulti === "number"
        ? this.props.scene.panBPMMulti
        : 0;
    const panDuration =
      typeof this.props.scene.panDuration === "number"
        ? this.props.scene.panDuration
        : 0;
    const panDurationMin =
      typeof this.props.scene.panDurationMin === "number"
        ? this.props.scene.panDurationMin
        : 0;
    const panDurationMax =
      typeof this.props.scene.panDurationMax === "number"
        ? this.props.scene.panDurationMax
        : 0;
    const horizTransLevelMax =
      typeof this.props.scene.panHorizTransLevelMax === "number"
        ? this.props.scene.panHorizTransLevelMax
        : 0;
    const horizTransLevelMin =
      typeof this.props.scene.panHorizTransLevelMin === "number"
        ? this.props.scene.panHorizTransLevelMin
        : 0;
    const vertTransLevelMax =
      typeof this.props.scene.panVertTransLevelMax === "number"
        ? this.props.scene.panVertTransLevelMax
        : 0;
    const vertTransLevelMin =
      typeof this.props.scene.panVertTransLevelMin === "number"
        ? this.props.scene.panVertTransLevelMin
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
        spacing={this.props.scene.panning ? 2 : 0}
        alignItems="center"
        sx={{
          pointerEvents: this.props.tutorial != null ? "none" : undefined,
        }}
      >
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.scene.panning}
                onChange={(e) => this.onBoolInput("panning", e)}
              />
            }
            label="Panning"
          />
        </Grid>
        <Grid item xs={12}>
          <FullWidthCollapse in={this.props.scene.panning}>
            <Divider />
          </FullWidthCollapse>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid
              item
              xs={12}
              sm={
                !this.props.sidebar &&
                this.props.scene.panHorizTransType != HTF.none
                  ? 5
                  : 12
              }
            >
              <FullWidthPaddedCollapse in={this.props.scene.panning}>
                <FullWidthFormControl variant="standard">
                  <InputLabel>Move Horizontally</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.panHorizTransType}
                    onChange={(e) => this.onInput("panHorizTransType", e)}
                  >
                    {Object.values(HTF).map((tf) => {
                      switch (tf) {
                        case HTF.left:
                          return (
                            <MenuItem key={tf} value={tf}>
                              {en.get(tf)} then {en.get(HTF.right)}
                            </MenuItem>
                          );
                        case HTF.right:
                          return (
                            <MenuItem key={tf} value={tf}>
                              {en.get(tf)} then {en.get(HTF.left)}
                            </MenuItem>
                          );
                        case HTF.random:
                          return (
                            <MenuItem key={tf} value={tf}>
                              Random
                            </MenuItem>
                          );
                        default:
                          return (
                            <MenuItem key={tf} value={tf}>
                              {en.get(tf)}
                            </MenuItem>
                          );
                      }
                    })}
                  </Select>
                </FullWidthFormControl>
              </FullWidthPaddedCollapse>
            </Grid>
            <Grid
              item
              xs={12}
              sm={
                !this.props.sidebar &&
                this.props.scene.panHorizTransType != HTF.none
                  ? 7
                  : 12
              }
              sx={{
                p:
                  !this.props.scene.panning ||
                  this.props.scene.panHorizTransType == HTF.none
                    ? "0 !important"
                    : undefined,
              }}
            >
              <FullWidthPaddedCollapse
                in={
                  this.props.scene.panning &&
                  !this.props.scene.panHorizTransImg &&
                  this.props.scene.panHorizTransType != HTF.none
                }
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.scene.panHorizTransRandom}
                      size="small"
                      onChange={(e) =>
                        this.onBoolInput("panHorizTransRandom", e)
                      }
                    />
                  }
                  label="Randomize"
                />
              </FullWidthPaddedCollapse>
              <FullWidthPaddedCollapse
                in={
                  this.props.scene.panning &&
                  this.props.scene.panHorizTransType != HTF.none
                }
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.scene.panHorizTransImg}
                      size="small"
                      onChange={(e) => this.onBoolInput("panHorizTransImg", e)}
                    />
                  }
                  label="Use Img Width"
                />
              </FullWidthPaddedCollapse>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                p:
                  !this.props.scene.panning ||
                  this.props.scene.panHorizTransType == HTF.none
                    ? "0 !important"
                    : undefined,
              }}
            >
              <FullWidthCollapse
                in={
                  this.props.scene.panning &&
                  !this.props.scene.panHorizTransImg &&
                  this.props.scene.panHorizTransType != HTF.none &&
                  !this.props.scene.panHorizTransRandom
                }
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={this.state.panHorizTransLevel}
                      onChange={this.onPanHorizTransLevelChange}
                      onChangeCommitted={(e, value) =>
                        this.onSliderChange("panHorizTransLevel", e, value)
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => v + "%"}
                      aria-labelledby="horiz-trans-level-slider"
                    />
                  </Grid>
                  <PercentInputGrid item xs={3}>
                    <TextField
                      variant="standard"
                      value={this.state.panHorizTransLevel}
                      margin="dense"
                      onChange={(e) => this.onIntInput("panHorizTransLevel", e)}
                      onBlur={(e) => this.blurIntKey("panHorizTransLevel", e)}
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
                        "aria-labelledby": "horiz-trans-level-slider",
                      }}
                    />
                  </PercentInputGrid>
                </Grid>
              </FullWidthCollapse>
              <FullWidthCollapse
                in={
                  this.props.scene.panning &&
                  !this.props.scene.panHorizTransImg &&
                  this.props.scene.panHorizTransType != HTF.none &&
                  this.props.scene.panHorizTransRandom
                }
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography>Min: {horizTransLevelMin}%</Typography>
                    <Slider
                      defaultValue={horizTransLevelMin}
                      onChangeCommitted={(e, value) =>
                        this.onSliderChange("panHorizTransLevelMin", e, value)
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => v + "%"}
                      aria-labelledby="horiz-trans-min-slider"
                    />
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography>Max: {horizTransLevelMax}%</Typography>
                    <Slider
                      defaultValue={horizTransLevelMax}
                      onChangeCommitted={(e, value) =>
                        this.onSliderChange("panHorizTransLevelMax", e, value)
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => v + "%"}
                      aria-labelledby="horiz-trans-max-slider"
                    />
                  </Grid>
                </Grid>
              </FullWidthCollapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            p: !this.props.scene.panning ? "0 !important" : undefined,
          }}
        >
          <FullWidthCollapse in={this.props.scene.panning}>
            <Divider />
          </FullWidthCollapse>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid
              item
              xs={12}
              sm={
                !this.props.sidebar &&
                this.props.scene.panVertTransType != VTF.none
                  ? 5
                  : 12
              }
            >
              <FullWidthPaddedCollapse in={this.props.scene.panning}>
                <FullWidthFormControl variant="standard">
                  <InputLabel>Move Vertically</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.panVertTransType}
                    onChange={(e) => this.onInput("panVertTransType", e)}
                  >
                    {Object.values(VTF).map((tf) => {
                      switch (tf) {
                        case VTF.up:
                          return (
                            <MenuItem key={tf} value={tf}>
                              {en.get(tf)} then {en.get(VTF.down)}
                            </MenuItem>
                          );
                        case VTF.down:
                          return (
                            <MenuItem key={tf} value={tf}>
                              {en.get(tf)} then {en.get(VTF.up)}
                            </MenuItem>
                          );
                        case VTF.random:
                          return (
                            <MenuItem key={tf} value={tf}>
                              Random
                            </MenuItem>
                          );
                        default:
                          return (
                            <MenuItem key={tf} value={tf}>
                              {en.get(tf)}
                            </MenuItem>
                          );
                      }
                    })}
                  </Select>
                </FullWidthFormControl>
              </FullWidthPaddedCollapse>
            </Grid>
            <Grid
              item
              xs={12}
              sm={
                !this.props.sidebar &&
                this.props.scene.panVertTransType != VTF.none
                  ? 7
                  : 12
              }
              sx={{
                p:
                  !this.props.scene.panning ||
                  this.props.scene.panVertTransType == VTF.none
                    ? "0 !important"
                    : undefined,
              }}
            >
              <FullWidthPaddedCollapse
                in={
                  this.props.scene.panning &&
                  !this.props.scene.panVertTransImg &&
                  this.props.scene.panVertTransType != VTF.none
                }
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.scene.panVertTransRandom}
                      size="small"
                      onChange={(e) =>
                        this.onBoolInput("panVertTransRandom", e)
                      }
                    />
                  }
                  label="Randomize"
                />
              </FullWidthPaddedCollapse>
              <FullWidthPaddedCollapse
                in={
                  this.props.scene.panning &&
                  this.props.scene.panVertTransType != VTF.none
                }
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.scene.panVertTransImg}
                      size="small"
                      onChange={(e) => this.onBoolInput("panVertTransImg", e)}
                    />
                  }
                  label="Use Img Height"
                />
              </FullWidthPaddedCollapse>
            </Grid>
            <Grid
              id="test"
              item
              xs={12}
              sx={{
                p:
                  !this.props.scene.panning ||
                  this.props.scene.panVertTransType == VTF.none
                    ? "0 !important"
                    : undefined,
              }}
            >
              <FullWidthCollapse
                in={
                  this.props.scene.panning &&
                  !this.props.scene.panVertTransImg &&
                  this.props.scene.panVertTransType != VTF.none &&
                  !this.props.scene.panVertTransRandom
                }
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={this.state.panVertTransLevel}
                      onChange={this.onPanVertTransLevelChange}
                      onChangeCommitted={(e, value) =>
                        this.onSliderChange("panVertTransLevel", e, value)
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => v + "%"}
                      aria-labelledby="vert-trans-level-slider"
                    />
                  </Grid>
                  <PercentInputGrid item xs={3}>
                    <TextField
                      variant="standard"
                      value={this.state.panVertTransLevel}
                      margin="dense"
                      onChange={(e) => this.onIntInput("panVertTransLevel", e)}
                      onBlur={(e) => this.blurIntKey("panVertTransLevel", e)}
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
                        "aria-labelledby": "vert-trans-level-slider",
                      }}
                    />
                  </PercentInputGrid>
                </Grid>
              </FullWidthCollapse>
              <FullWidthCollapse
                in={
                  this.props.scene.panning &&
                  !this.props.scene.panVertTransImg &&
                  this.props.scene.panVertTransType != VTF.none &&
                  this.props.scene.panVertTransRandom
                }
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography>Min: {vertTransLevelMin}%</Typography>
                    <Slider
                      defaultValue={vertTransLevelMin}
                      onChangeCommitted={(e, value) =>
                        this.onSliderChange("panVertTransLevelMin", e, value)
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => v + "%"}
                      aria-labelledby="vert-trans-min-slider"
                    />
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Typography>Max: {vertTransLevelMax}%</Typography>
                    <Slider
                      defaultValue={vertTransLevelMax}
                      onChangeCommitted={(e, value) =>
                        this.onSliderChange("panVertTransLevelMax", e, value)
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => v + "%"}
                      aria-labelledby="vert-trans-max-slider"
                    />
                  </Grid>
                </Grid>
              </FullWidthCollapse>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            p: !this.props.scene.panning ? "0 !important" : undefined,
          }}
        >
          <FullWidthCollapse in={this.props.scene.panning}>
            <Divider />
          </FullWidthCollapse>
        </Grid>
        <Grid item xs={12}>
          <FullWidthCollapse in={this.props.scene.panning}>
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
                    value={this.props.scene.panTF}
                    onChange={(e) => this.onInput("panTF", e)}
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
                <FullWidthCollapse
                  in={
                    this.props.scene.panning && this.props.scene.panTF == TF.sin
                  }
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
                        value={this.state.panSinRate}
                        onChange={this.onPanSinRateChange}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("panSinRate", e, value)
                        }
                        valueLabelDisplay="auto"
                        aria-labelledby="pan-sin-rate-slider"
                      />
                    </Grid>
                    <PercentInputGrid item xs={3}>
                      <TextField
                        variant="standard"
                        value={this.state.panSinRate}
                        onChange={(e) => this.onIntInput("panSinRate", e)}
                        onBlur={(e) => this.blurIntKey("panSinRate", e)}
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
                          "aria-labelledby": "pan-sin-rate-slider",
                        }}
                      />
                    </PercentInputGrid>
                  </Grid>
                </FullWidthCollapse>
                <FullWidthCollapse
                  in={
                    this.props.scene.panning && this.props.scene.panTF == TF.bpm
                  }
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    BPM Multiplier {this.props.scene.panBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={panBPMMulti}
                    onChangeCommitted={(e, value) =>
                      this.onSliderChange("panBPMMulti", e, value)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => v / 10 + "x"}
                    aria-labelledby="pan-bpm-multi-slider"
                  />
                </FullWidthCollapse>
                <FullWidthCollapse
                  in={
                    this.props.scene.panning &&
                    this.props.scene.panTF == TF.constant
                  }
                >
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={panDuration}
                    onChange={(e) => this.onIntInput("panDuration", e)}
                    onBlur={(e) => this.blurIntKey("panDuration", e)}
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
              this.props.scene.panning &&
              (this.props.scene.panTF == TF.random ||
                this.props.scene.panTF == TF.sin)
            }
          >
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={panDurationMin}
                  onChange={(e) => this.onIntInput("panDurationMin", e)}
                  onBlur={(e) => this.blurIntKey("panDurationMin", e)}
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
                  value={panDurationMax}
                  onChange={(e) => this.onIntInput("panDurationMax", e)}
                  onBlur={(e) => this.blurIntKey("panDurationMax", e)}
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
                p: !this.props.scene.panning ? "0 !important" : undefined,
              }}
            >
              <FullWidthCollapse in={this.props.scene.panning}>
                <Divider />
              </FullWidthCollapse>
            </Grid>
            <Grid item xs={12}>
              <FullWidthCollapse in={this.props.scene.panning}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FullWidthFormControl variant="standard">
                      <InputLabel>Start Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.panStartEase}
                        onChange={(e) => this.onInput("panStartEase", e)}
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
                        this.props.scene.panStartEase == EA.polyIn ||
                        this.props.scene.panStartEase == EA.polyOut ||
                        this.props.scene.panStartEase == EA.polyInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Exponent: {this.props.scene.panStartExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.panStartExp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("panStartExp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="start-exp-slider"
                      />
                    </FullWidthCollapse>
                    <FullWidthCollapse
                      in={
                        this.props.scene.panStartEase == EA.backIn ||
                        this.props.scene.panStartEase == EA.backOut ||
                        this.props.scene.panStartEase == EA.backInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Overshoot: {this.props.scene.panStartOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.panStartOv}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("panStartOv", e, value)
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
                        this.props.scene.panStartEase == EA.elasticIn ||
                        this.props.scene.panStartEase == EA.elasticOut ||
                        this.props.scene.panStartEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Amplitude: {this.props.scene.panStartAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.panStartAmp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("panStartAmp", e, value)
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
                        this.props.scene.panStartEase == EA.elasticIn ||
                        this.props.scene.panStartEase == EA.elasticOut ||
                        this.props.scene.panStartEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Period: {this.props.scene.panStartPer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.panStartPer}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("panStartPer", e, value)
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
                        value={this.props.scene.panEndEase}
                        onChange={(e) => this.onInput("panEndEase", e)}
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
                        this.props.scene.panEndEase == EA.polyIn ||
                        this.props.scene.panEndEase == EA.polyOut ||
                        this.props.scene.panEndEase == EA.polyInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Exponent: {this.props.scene.panEndExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.panEndExp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("panEndExp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="end-exp-slider"
                      />
                    </FullWidthCollapse>
                    <FullWidthCollapse
                      in={
                        this.props.scene.panEndEase == EA.backIn ||
                        this.props.scene.panEndEase == EA.backOut ||
                        this.props.scene.panEndEase == EA.backInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Overshoot: {this.props.scene.panEndOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.panEndOv}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("panEndOv", e, value)
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
                        this.props.scene.panEndEase == EA.elasticIn ||
                        this.props.scene.panEndEase == EA.elasticOut ||
                        this.props.scene.panEndEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Amplitude: {this.props.scene.panEndAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.panEndAmp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("panEndAmp", e, value)
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
                        this.props.scene.panEndEase == EA.elasticIn ||
                        this.props.scene.panEndEase == EA.elasticOut ||
                        this.props.scene.panEndEase == EA.elasticInOut
                      }
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Period: {this.props.scene.panEndPer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.panEndPer}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("panEndPer", e, value)
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

    // Update sliders
    if (key == "panHorizTransLevel") {
      this.setState({ panHorizTransLevel: Number(value) });
    } else if (key == "panVertTransLevel") {
      this.setState({ panVertTransLevel: Number(value) });
    } else if (key == "panSinRate") {
      this.setState({ panSinRate: Number(value) });
    }
  };

  onPanHorizTransLevelChange = (
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ panHorizTransLevel: value as number });
  };

  onPanVertTransLevelChange = (
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ panVertTransLevel: value as number });
  };

  onPanSinRateChange = (
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ panSinRate: value as number });
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

export default PanningCard;
