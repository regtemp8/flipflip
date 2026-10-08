import * as React from "react";
import clsx from "clsx";

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
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { EA, STF, TF } from "../../../common/const";
import { SceneSettings } from "../../../common/Config";
import en from "../../../common/en";
import Scene from "../../../common/Scene";
import Audio from "../../../common/Audio";

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: "100%",
    },
    paddingLeft: {
      [theme.breakpoints.up("sm")]: {
        paddingLeft: theme.spacing(1),
      },
    },
    endInput: {
      paddingLeft: theme.spacing(1),
      paddingTop: 0,
    },
    percentInput: {
      minWidth: theme.spacing(11),
    },
    backdropTop: {
      zIndex: `${theme.zIndex.modal + 1} !important`,
    },
    highlight: {
      borderWidth: 2,
      borderColor: theme.palette.secondary.main,
      borderStyle: "solid",
    },
    disable: {
      pointerEvents: "none",
    },
  });

interface SlideCardProps {
  classes: any;
  scene: Scene | SceneSettings;
  easingControls: boolean;
  sidebar: boolean;
  tutorial: string;
  onUpdateScene: (
    scene: Scene | SceneSettings,
    fn: (scene: Scene | SceneSettings) => void,
  ) => void;
}

interface SlideCardState {
  slideSinRate: number;
}

class SlideCard extends React.Component<SlideCardProps, SlideCardState> {
  constructor(props: SlideCardProps) {
    super(props);

    const slideSinRate =
      typeof this.props.scene.slideSinRate === "number"
        ? this.props.scene.slideSinRate
        : 0;

    this.state = { slideSinRate };
  }

  componentDidUpdate(props: SlideCardProps) {
    if (props.scene.slideSinRate != this.props.scene.slideSinRate) {
      const slideSinRate =
        typeof this.props.scene.slideSinRate === "number"
          ? this.props.scene.slideSinRate
          : 0;

      this.setState({ slideSinRate });
    }
  }

  render() {
    const classes = this.props.classes;

    const slideBPMMulti =
      typeof this.props.scene.slideBPMMulti === "number"
        ? this.props.scene.slideBPMMulti
        : 0;
    const slideDistance =
      typeof this.props.scene.slideDistance === "number"
        ? this.props.scene.slideDistance
        : 0;
    const slideDuration =
      typeof this.props.scene.slideDuration === "number"
        ? this.props.scene.slideDuration
        : 0;
    const slideDurationMin =
      typeof this.props.scene.slideDurationMin === "number"
        ? this.props.scene.slideDurationMin
        : 0;
    const slideDurationMax =
      typeof this.props.scene.slideDurationMax === "number"
        ? this.props.scene.slideDurationMax
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
        spacing={this.props.scene.slide ? 2 : 0}
        alignItems="center"
        className={clsx(this.props.tutorial != null && classes.disable)}
      >
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.scene.slide}
                onChange={(e) => this.onBoolInput("slide", e)}
              />
            }
            label="Slide"
          />
        </Grid>
        <Grid item xs={12}>
          <Collapse in={this.props.scene.slide} className={classes.fullWidth}>
            <Divider />
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={this.props.scene.slide} className={classes.fullWidth}>
            <Grid container spacing={2} alignItems="center">
              <Grid
                item
                xs={12}
                sm={this.props.sidebar ? 12 : 4}
                style={{ paddingTop: 10 }}
              >
                <FormControl variant="standard" className={classes.fullWidth}>
                  <InputLabel>Direction</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.slideType}
                    onChange={(e) => this.onInput("slideType", e)}
                  >
                    {Object.values(STF).map((tf) => (
                      <MenuItem key={tf} value={tf}>
                        {en.get(tf)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
                <Typography
                  variant="caption"
                  component="div"
                  color="textSecondary"
                >
                  Distance: {slideDistance}%
                </Typography>
                <Slider
                  min={1}
                  defaultValue={slideDistance}
                  onChangeCommitted={(e, value) =>
                    this.onSliderChange("slideDistance", e, value)
                  }
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => v + "%"}
                  aria-labelledby="slide-distance-slider"
                />
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 4}>
                <FormControl variant="standard" className={classes.fullWidth}>
                  <InputLabel>Timing</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.slideTF}
                    onChange={(e) => this.onInput("slideTF", e)}
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
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
                <Collapse
                  in={this.props.scene.slideTF == TF.sin}
                  className={classes.fullWidth}
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
                        value={this.state.slideSinRate}
                        onChange={this.onSlideSinRateChange}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("slideSinRate", e, value)
                        }
                        valueLabelDisplay="auto"
                        aria-labelledby="slide-sin-rate-slider"
                      />
                    </Grid>
                    <Grid item xs={3} className={classes.percentInput}>
                      <TextField
                        variant="standard"
                        value={this.state.slideSinRate}
                        onChange={(e) => this.onIntInput("slideSinRate", e)}
                        onBlur={(e) => this.blurIntKey("slideSinRate", e)}
                        inputProps={{
                          className: classes.endInput,
                          step: 5,
                          min: 0,
                          max: 100,
                          type: "number",
                          "aria-labelledby": "slide-sin-rate-slider",
                        }}
                      />
                    </Grid>
                  </Grid>
                </Collapse>
                <Collapse
                  in={this.props.scene.slideTF == TF.bpm}
                  className={classes.fullWidth}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    BPM Multiplier {this.props.scene.slideBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={slideBPMMulti}
                    onChangeCommitted={(e, value) =>
                      this.onSliderChange("slideBPMMulti", e, value)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => v / 10 + "x"}
                    aria-labelledby="slide-bpm-multi-slider"
                  />
                </Collapse>
                <Collapse
                  in={this.props.scene.slideTF == TF.constant}
                  className={classes.fullWidth}
                >
                  <TextField
                    variant="outlined"
                    label="For"
                    margin="dense"
                    value={slideDuration}
                    onChange={(e) => this.onIntInput("slideDuration", e)}
                    onBlur={(e) => this.blurIntKey("slideDuration", e)}
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
                </Collapse>
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Collapse
            in={
              this.props.scene.slide &&
              (this.props.scene.slideTF == TF.random ||
                this.props.scene.slideTF == TF.sin)
            }
            className={classes.fullWidth}
          >
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={slideDurationMin}
                  onChange={(e) => this.onIntInput("slideDurationMin", e)}
                  onBlur={(e) => this.blurIntKey("slideDurationMin", e)}
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
                  value={slideDurationMax}
                  onChange={(e) => this.onIntInput("slideDurationMax", e)}
                  onBlur={(e) => this.blurIntKey("slideDurationMax", e)}
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
          </Collapse>
        </Grid>
        {this.props.easingControls && (
          <React.Fragment>
            <Grid
              item
              xs={12}
              className={clsx(!this.props.scene.slide && classes.noPadding)}
            >
              <Collapse
                in={this.props.scene.slide}
                className={classes.fullWidth}
              >
                <Divider />
              </Collapse>
            </Grid>
            <Grid item xs={12}>
              <Collapse
                in={this.props.scene.slide}
                className={classes.fullWidth}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <FormControl
                      variant="standard"
                      className={classes.fullWidth}
                    >
                      <InputLabel>Easing</InputLabel>
                      <Select
                        variant="standard"
                        value={this.props.scene.slideEase}
                        onChange={(e) => this.onInput("slideEase", e)}
                      >
                        {Object.values(EA).map((rf) => (
                          <MenuItem key={rf} value={rf}>
                            {en.get(rf)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse
                      in={
                        this.props.scene.slideEase == EA.polyIn ||
                        this.props.scene.slideEase == EA.polyOut ||
                        this.props.scene.slideEase == EA.polyInOut
                      }
                      className={classes.fullWidth}
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Exponent: {this.props.scene.slideExp / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.slideExp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("slideExp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="exp-slider"
                      />
                    </Collapse>
                    <Collapse
                      in={
                        this.props.scene.slideEase == EA.backIn ||
                        this.props.scene.slideEase == EA.backOut ||
                        this.props.scene.slideEase == EA.backInOut
                      }
                      className={classes.fullWidth}
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Overshoot: {this.props.scene.slideOv / 2}
                      </Typography>
                      <Slider
                        min={1}
                        max={10}
                        defaultValue={this.props.scene.slideOv}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("slideOv", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 2}
                        aria-labelledby="ov-slider"
                      />
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse
                      in={
                        this.props.scene.slideEase == EA.elasticIn ||
                        this.props.scene.slideEase == EA.elasticOut ||
                        this.props.scene.slideEase == EA.elasticInOut
                      }
                      className={classes.fullWidth}
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Amplitude: {this.props.scene.slideAmp / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={40}
                        defaultValue={this.props.scene.slideAmp}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("slideAmp", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 20}
                        aria-labelledby="amp-slider"
                      />
                    </Collapse>
                  </Grid>
                  <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                    <Collapse
                      in={
                        this.props.scene.slideEase == EA.elasticIn ||
                        this.props.scene.slideEase == EA.elasticOut ||
                        this.props.scene.slideEase == EA.elasticInOut
                      }
                      className={classes.fullWidth}
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Period: {this.props.scene.slidePer / 20}
                      </Typography>
                      <Slider
                        min={1}
                        max={20}
                        defaultValue={this.props.scene.slidePer}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("slidePer", e, value)
                        }
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => v / 20}
                        aria-labelledby="per-slider"
                      />
                    </Collapse>
                  </Grid>
                </Grid>
              </Collapse>
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

    // Update slideSinRate slider
    if (key == "slideSinRate") {
      this.setState({ slideSinRate: Number(value) });
    }
  };

  onSlideSinRateChange = (
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ slideSinRate: value as number });
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

(SlideCard as any).displayName = "SlideCard";
export default withStyles(styles)(SlideCard);
