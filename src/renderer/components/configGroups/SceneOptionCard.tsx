import * as React from "react";
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  Fab,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ListIcon from "@mui/icons-material/List";

import { BT, IT, SDT, TF } from "../../../common/const";
import SceneSelect from "./SceneSelect";
import en from "../../../common/en";
import Overlay from "../../../common/Overlay";
import Scene from "../../../common/Scene";
import ColorPicker from "../config/ColorPicker";
import ColorSetPicker from "../config/ColorSetPicker";
import MultiSceneSelect from "./MultiSceneSelect";
import { areWeightsValid } from "../../data/utils";
import Audio from "../../../common/Audio";
import SceneGrid from "../../../common/SceneGrid";
import { SceneBase } from "../../../common/SceneBase";
import { styled } from "@mui/material/styles";

const FullWidthCollapse = styled(Collapse)(() => ({
  width: "100%",
}));
const FullWidthFormControl = styled(FormControl)(() => ({
  width: "100%",
}));
const PercentInputGrid = styled(Grid)(({ theme }) => ({
  minWidth: theme.spacing(11),
}));
const SelectOffsetGrid = styled(Grid)(() => ({
  paddingTop: "10px !important",
  paddingBottom: "0 !important",
}));

interface SceneOptionCardProps<T extends SceneBase> {
  allScenes: Array<Scene>;
  allSceneGrids: Array<SceneGrid>;
  scene: T;
  sidebar?: boolean;
  tutorial?: string;
  isTagging?: boolean;
  onUpdateScene: (scene: T, fn: (scene: T) => void) => void;
  onGenerate?: (scene: Scene | SceneGrid, children?: boolean) => void;
}

interface SceneOptionCardState {
  timingSinRate: number;
  backForthSinRate: number;
  randomSceneList?: Array<number>;
}

class SceneOptionCard<T extends SceneBase> extends React.Component<
  SceneOptionCardProps<T>,
  SceneOptionCardState
> {
  constructor(props: SceneOptionCardProps<T>) {
    super(props);

    const timingSinRate =
      typeof this.props.scene.timingSinRate === "number"
        ? this.props.scene.timingSinRate
        : 0;

    const backForthSinRate =
      typeof this.props.scene.backForthSinRate === "number"
        ? this.props.scene.backForthSinRate
        : 0;

    this.state = { timingSinRate, backForthSinRate };
  }

  componentDidUpdate(props: SceneOptionCardProps<T>) {
    if (props.scene.timingSinRate != this.props.scene.timingSinRate) {
      const timingSinRate =
        typeof this.props.scene.timingSinRate === "number"
          ? this.props.scene.timingSinRate
          : 0;

      this.setState({ timingSinRate });
    }
    if (props.scene.backForthSinRate != this.props.scene.backForthSinRate) {
      const backForthSinRate =
        typeof this.props.scene.backForthSinRate === "number"
          ? this.props.scene.backForthSinRate
          : 0;

      this.setState({ backForthSinRate });
    }
  }

  render() {
    const timingBPMMulti =
      typeof this.props.scene.timingBPMMulti === "number"
        ? this.props.scene.timingBPMMulti
        : 0;
    const timingConstant =
      typeof this.props.scene.timingConstant === "number"
        ? this.props.scene.timingConstant
        : 0;
    const timingMin =
      typeof this.props.scene.timingMin === "number"
        ? this.props.scene.timingMin
        : 0;
    const timingMax =
      typeof this.props.scene.timingMax === "number"
        ? this.props.scene.timingMax
        : 0;
    const backForthBPMMulti =
      typeof this.props.scene.backForthBPMMulti === "number"
        ? this.props.scene.backForthBPMMulti
        : 0;
    const backForthConstant =
      typeof this.props.scene.backForthConstant === "number"
        ? this.props.scene.backForthConstant
        : 0;
    const backForthMin =
      typeof this.props.scene.backForthMin === "number"
        ? this.props.scene.backForthMin
        : 0;
    const backForthMax =
      typeof this.props.scene.backForthMax === "number"
        ? this.props.scene.backForthMax
        : 0;
    const backgroundBlur =
      typeof this.props.scene.backgroundBlur === "number"
        ? this.props.scene.backgroundBlur
        : 0;
    const nextSceneTime =
      typeof this.props.scene.nextSceneTime === "number"
        ? this.props.scene.nextSceneTime
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
        <Grid
          item
          xs={12}
          sx={{
            borderWidth: this.props.tutorial == SDT.timing ? 2 : 0,
            borderColor: "secondary.main",
            borderStyle: "solid",
          }}
        >
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
                  value={this.props.scene.timingFunction}
                  onChange={(e) => this.onInput("timingFunction", e)}
                >
                  {[TF.constant, TF.random, TF.sin, TF.bpm].map((tf) => {
                    if (tf == TF.bpm) {
                      return (
                        <MenuItem key={tf} value={tf}>
                          {en.get(tf)}{" "}
                          {!hasBPM && (
                            <Tooltip
                              disableInteractive
                              title="Missing audio with BPM"
                            >
                              <ErrorOutlineIcon
                                color="error"
                                sx={{ float: "right" }}
                              />
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
              <FullWidthCollapse in={this.props.scene.timingFunction == TF.sin}>
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
                      value={this.state.timingSinRate}
                      onChange={this.onTimingSinRateChange}
                      onChangeCommitted={(e, value) =>
                        this.onSliderChange("timingSinRate", e, value)
                      }
                      valueLabelDisplay="auto"
                      aria-labelledby="scene-sin-rate-slider"
                    />
                  </Grid>
                  <PercentInputGrid item xs={3}>
                    <TextField
                      variant="standard"
                      value={this.state.timingSinRate}
                      onChange={(e) => this.onIntInput("timingSinRate", e)}
                      onBlur={(e) => this.blurIntKey("timingSinRate", e)}
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
                        "aria-labelledby": "scene-sin-rate-slider",
                      }}
                    />
                  </PercentInputGrid>
                </Grid>
              </FullWidthCollapse>
              <FullWidthCollapse in={this.props.scene.timingFunction == TF.bpm}>
                <Typography
                  variant="caption"
                  component="div"
                  color="textSecondary"
                >
                  BPM Multiplier {this.props.scene.timingBPMMulti / 10}x
                </Typography>
                <Slider
                  min={1}
                  max={100}
                  defaultValue={timingBPMMulti}
                  onChangeCommitted={(e, value) =>
                    this.onSliderChange("timingBPMMulti", e, value)
                  }
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => v / 10 + "x"}
                  aria-labelledby="scene-bpm-multi-slider"
                />
              </FullWidthCollapse>
              <FullWidthCollapse
                in={this.props.scene.timingFunction == TF.constant}
              >
                <TextField
                  variant="outlined"
                  label="For"
                  margin="dense"
                  value={timingConstant}
                  onChange={(e) => this.onIntInput("timingConstant", e)}
                  onBlur={(e) => this.blurIntKey("timingConstant", e)}
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
        </Grid>
        <Grid item xs={12}>
          <FullWidthCollapse
            in={
              this.props.scene.timingFunction == TF.random ||
              this.props.scene.timingFunction == TF.sin
            }
          >
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={timingMin}
                  onChange={(e) => this.onIntInput("timingMin", e)}
                  onBlur={(e) => this.blurIntKey("timingMin", e)}
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
                  value={timingMax}
                  onChange={(e) => this.onIntInput("timingMax", e)}
                  onBlur={(e) => this.blurIntKey("timingMax", e)}
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
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            borderWidth: this.props.tutorial == SDT.backForth ? 2 : 0,
            borderColor: "secondary.main",
            borderStyle: "solid",
          }}
        >
          <Grid container alignItems="center">
            <Grid item xs={12}>
              <Tooltip
                disableInteractive
                title="Go back and forth between the last two images"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.props.scene.backForth}
                      onChange={(e) => this.onBoolInput("backForth", e)}
                    />
                  }
                  label="Back/Forth"
                />
              </Tooltip>
            </Grid>
          </Grid>
          <Collapse in={this.props.scene.backForth}>
            <Grid container spacing={2} alignItems="center">
              <Grid
                item
                xs={12}
                sm={this.props.sidebar ? 12 : 4}
                style={{ paddingTop: 10 }}
              >
                <FullWidthFormControl variant="standard">
                  <InputLabel>Back/Forth Timing</InputLabel>
                  <Select
                    variant="standard"
                    value={this.props.scene.backForthTF}
                    onChange={(e) => this.onInput("backForthTF", e)}
                  >
                    {[TF.constant, TF.random, TF.sin, TF.bpm].map((tf) => {
                      if (tf == TF.bpm) {
                        return (
                          <MenuItem key={tf} value={tf}>
                            {en.get(tf)}{" "}
                            {!hasBPM && (
                              <Tooltip
                                disableInteractive
                                title="Missing audio with BPM"
                              >
                                <ErrorOutlineIcon
                                  color="error"
                                  sx={{ float: "right" }}
                                />
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
                <FullWidthCollapse in={this.props.scene.backForthTF == TF.sin}>
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
                        value={this.state.backForthSinRate}
                        onChange={this.onBackForthSinRateChange}
                        onChangeCommitted={(e, value) =>
                          this.onSliderChange("backForthSinRate", e, value)
                        }
                        valueLabelDisplay="auto"
                        aria-labelledby="bf-sin-rate-slider"
                      />
                    </Grid>
                    <PercentInputGrid item xs={3}>
                      <TextField
                        variant="standard"
                        value={this.state.backForthSinRate}
                        onChange={(e) => this.onIntInput("backForthSinRate", e)}
                        onBlur={(e) => this.blurIntKey("backForthSinRate", e)}
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
                          "aria-labelledby": "bf-sin-rate-slider",
                        }}
                      />
                    </PercentInputGrid>
                  </Grid>
                </FullWidthCollapse>
                <FullWidthCollapse in={this.props.scene.backForthTF == TF.bpm}>
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    BPM Multiplier {this.props.scene.backForthBPMMulti / 10}x
                  </Typography>
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={backForthBPMMulti}
                    onChangeCommitted={(e, value) =>
                      this.onSliderChange("backForthBPMMulti", e, value)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => v / 10 + "x"}
                    aria-labelledby="bf-bpm-multi-slider"
                  />
                </FullWidthCollapse>
                <FullWidthCollapse
                  in={this.props.scene.backForthTF == TF.constant}
                >
                  <TextField
                    variant="outlined"
                    label="Every"
                    margin="dense"
                    value={backForthConstant}
                    onChange={(e) => this.onIntInput("backForthConstant", e)}
                    onBlur={(e) => this.blurIntKey("backForthConstant", e)}
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
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            p: !(
              this.props.scene.backForth &&
              (this.props.scene.backForthTF == TF.random ||
                this.props.scene.backForthTF == TF.sin)
            )
              ? "0 !important"
              : undefined,
          }}
        >
          <FullWidthCollapse
            in={
              this.props.scene.backForth &&
              (this.props.scene.backForthTF == TF.random ||
                this.props.scene.backForthTF == TF.sin)
            }
          >
            <Grid container alignItems="center">
              <Grid item xs={12} sm={this.props.sidebar ? 12 : 6}>
                <TextField
                  variant="outlined"
                  label="Between"
                  margin="dense"
                  value={backForthMin}
                  onChange={(e) => this.onIntInput("backForthMin", e)}
                  onBlur={(e) => this.blurIntKey("backForthMin", e)}
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
                  value={backForthMax}
                  onChange={(e) => this.onIntInput("backForthMax", e)}
                  onBlur={(e) => this.blurIntKey("backForthMax", e)}
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
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            borderWidth: this.props.tutorial == SDT.imageSizing ? 2 : 0,
            borderColor: "secondary.main",
            borderStyle: "solid",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid
              item
              xs={this.props.sidebar ? 8 : 12}
              sm={this.props.sidebar ? 8 : 6}
            >
              <FullWidthFormControl variant="standard">
                <InputLabel>Image Sizing</InputLabel>
                <Select
                  variant="standard"
                  value={this.props.scene.imageType}
                  onChange={(e) => this.onInput("imageType", e)}
                >
                  {Object.values(IT).map((it) => (
                    <MenuItem key={it} value={it}>
                      {en.get(it)}
                    </MenuItem>
                  ))}
                </Select>
              </FullWidthFormControl>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 6} />
            <Grid
              item
              xs={this.props.sidebar ? 8 : 12}
              sm={this.props.sidebar ? 8 : 4}
            >
              <FullWidthFormControl variant="standard">
                <InputLabel>Background</InputLabel>
                <Select
                  variant="standard"
                  value={this.props.scene.backgroundType}
                  onChange={(e) => this.onInput("backgroundType", e)}
                >
                  {Object.values(BT).map((bt) => (
                    <MenuItem key={bt} value={bt}>
                      {en.get(bt)}
                    </MenuItem>
                  ))}
                </Select>
              </FullWidthFormControl>
            </Grid>
            <Grid item xs={12} sm={this.props.sidebar ? 12 : 8}>
              <FullWidthCollapse
                in={this.props.scene.backgroundType == BT.blur}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="textSecondary"
                >
                  Blur: {this.props.scene.backgroundBlur}px
                </Typography>
                <Slider
                  min={0}
                  max={30}
                  defaultValue={backgroundBlur}
                  onChangeCommitted={(e, value) =>
                    this.onSliderChange("backgroundBlur", e, value)
                  }
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => v + "px"}
                  aria-labelledby="scene-bg-color-slider"
                />
              </FullWidthCollapse>
              <FullWidthCollapse
                in={this.props.scene.backgroundType == BT.color}
              >
                {this.props.scene.backgroundType == BT.color && (
                  <ColorPicker
                    currentColor={this.props.scene.backgroundColor}
                    onChangeColor={(color) =>
                      this.changeKey("backgroundColor", color)
                    }
                  />
                )}
              </FullWidthCollapse>
              <FullWidthCollapse
                in={this.props.scene.backgroundType == BT.colorSet}
              >
                {this.props.scene.backgroundType == BT.colorSet && (
                  <ColorSetPicker
                    currentColors={this.props.scene.backgroundColorSet}
                    onChangeColors={(colors) =>
                      this.changeKey("backgroundColorSet", colors)
                    }
                  />
                )}
              </FullWidthCollapse>
            </Grid>
          </Grid>
        </Grid>
        {!this.props.isTagging && (
          <React.Fragment>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                borderWidth: this.props.tutorial == SDT.nextScene ? 2 : 0,
                borderColor: "secondary.main",
                borderStyle: "solid",
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid
                  item
                  sx={{
                    pt: "0 !important",
                  }}
                  xs={this.props.scene.nextSceneID == -1 ? 10 : 12}
                  sm={
                    this.props.scene.nextSceneID == -1
                      ? this.props.sidebar
                        ? 10
                        : 5
                      : this.props.sidebar
                        ? 12
                        : 7
                  }
                >
                  <Typography
                    color={(theme) => theme.palette.text.secondary}
                    variant="caption"
                  >
                    Next Scene
                  </Typography>
                  <SceneSelect
                    scene={this.props.scene}
                    allScenes={this.props.allScenes}
                    value={this.props.scene.nextSceneID}
                    includeExtra
                    getSceneName={this.getSceneName}
                    onChange={(s: number) =>
                      this.changeIntKey("nextSceneID", s.toString())
                    }
                  />
                  <Dialog
                    PaperProps={{
                      sx: {
                        minWidth: 400,
                        overflow: "visible",
                      },
                    }}
                    open={this.state.randomSceneList != null}
                    onClose={this.onRandomSceneDialog}
                    aria-describedby="random-scene-description"
                  >
                    <DialogContent sx={{ overflow: "visible" }}>
                      <DialogContentText id="random-scene-description">
                        Select which scenes to include:
                      </DialogContentText>
                      <MultiSceneSelect
                        scene={this.props.scene}
                        allScenes={this.props.allScenes}
                        values={
                          this.state?.randomSceneList ??
                          this.props.scene.nextSceneRandoms
                        }
                        getSceneName={this.getSceneName}
                        onChange={this.changeRandomScenes}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.onSelectNone}>Select None</Button>
                      <Button onClick={this.onSelectAll}>Select All</Button>
                    </DialogActions>
                    <DialogActions>
                      <Button
                        onClick={this.onRandomSceneDialog}
                        color="secondary"
                      >
                        Cancel
                      </Button>
                      <Button onClick={this.onSaveRandomScene} color="primary">
                        Save
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Grid>
                {this.props.scene.nextSceneID == -1 && (
                  <SelectOffsetGrid item>
                    <Tooltip
                      disableInteractive
                      title={
                        this.props.scene.nextSceneRandoms.length == 0
                          ? "Select Scenes (EMPTY)"
                          : "Select Scenes"
                      }
                    >
                      <IconButton
                        sx={{
                          color:
                            this.props.scene.nextSceneRandoms.length == 0
                              ? "error.main"
                              : undefined,
                        }}
                        onClick={this.onRandomSceneDialog}
                        size="large"
                      >
                        <ListIcon />
                      </IconButton>
                    </Tooltip>
                  </SelectOffsetGrid>
                )}
                <SelectOffsetGrid item xs={12} sm={this.props.sidebar ? 12 : 5}>
                  <Collapse
                    in={
                      this.props.scene.nextSceneID != 0 &&
                      !this.props.scene.nextSceneAllImages
                    }
                  >
                    <TextField
                      variant="outlined"
                      label="Play after"
                      margin="dense"
                      value={nextSceneTime}
                      onChange={(e) => this.onIntInput("nextSceneTime", e)}
                      onBlur={(e) => this.blurIntKey("nextSceneTime", e)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">ms</InputAdornment>
                        ),
                      }}
                      inputProps={{
                        min: 0,
                        type: "number",
                      }}
                    />
                  </Collapse>
                </SelectOffsetGrid>
                <Grid item xs>
                  <Collapse in={this.props.scene.nextSceneID != 0}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={this.props.scene.nextSceneAllImages}
                          onChange={(e) =>
                            this.onBoolInput("nextSceneAllImages", e)
                          }
                        />
                      }
                      label="Play After All Images"
                    />
                  </Collapse>
                </Grid>
                {!this.props.sidebar && (
                  <React.Fragment>
                    <Grid item xs>
                      <Collapse in={this.props.scene.nextSceneID != 0}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={this.props.scene.persistAudio}
                              onChange={(e) =>
                                this.onBoolInput("persistAudio", e)
                              }
                            />
                          }
                          label="Persist Audio"
                        />
                      </Collapse>
                    </Grid>
                    <Grid item xs>
                      <Collapse in={this.props.scene.nextSceneID != 0}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={this.props.scene.persistText}
                              onChange={(e) =>
                                this.onBoolInput("persistText", e)
                              }
                            />
                          }
                          label="Persist Text Overlays"
                        />
                      </Collapse>
                    </Grid>
                  </React.Fragment>
                )}
              </Grid>
            </Grid>
          </React.Fragment>
        )}
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            borderWidth: this.props.tutorial == SDT.overlays ? 2 : 0,
            borderColor: "secondary.main",
            borderStyle: "solid",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.props.scene.overlayEnabled}
                    onChange={(e) => this.onBoolInput("overlayEnabled", e)}
                  />
                }
                label="Overlays"
              />
            </Grid>
            <Grid item>
              <Collapse in={this.props.scene.overlayEnabled}>
                <Fab
                  sx={{ boxShadow: "none" }}
                  onClick={this.onAddOverlay}
                  size="small"
                >
                  <AddIcon />
                </Fab>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        {this.props.scene.overlays.map((o) => {
          const overlayOpacity = typeof o.opacity === "number" ? o.opacity : 0;
          const oScene = this.props.allScenes.find((s) => s.id == o.sceneID);
          const regenerate =
            oScene && oScene.generatorWeights && oScene.regenerate;
          const invalid = regenerate && !areWeightsValid(oScene);
          return (
            <React.Fragment key={o.id}>
              <Grid
                item
                xs={12}
                sx={{
                  p: !this.props.scene.overlayEnabled
                    ? "0 !important"
                    : undefined,
                }}
              >
                <FullWidthCollapse in={this.props.scene.overlayEnabled}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={this.props.sidebar ? 12 : 5}>
                      <Typography
                        color={(theme) => theme.palette.text.secondary}
                        variant="caption"
                      >
                        Overlay{regenerate ? (invalid ? " ✗" : " ⟳") : ""}
                      </Typography>
                      <SceneSelect
                        allScenes={this.props.allScenes}
                        allSceneGrids={this.props.allSceneGrids}
                        value={o.sceneID}
                        getSceneName={this.getSceneName}
                        onChange={(s: number) =>
                          this.changeOverlayIntKey(
                            o.id,
                            "sceneID",
                            s.toString(),
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={this.props.sidebar ? 12 : 7}>
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                      >
                        Overlay Opacity: {o.opacity}%
                      </Typography>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs>
                          <Slider
                            min={0}
                            max={100}
                            defaultValue={overlayOpacity}
                            onChangeCommitted={(e, value) =>
                              this.onOverlaySliderChange(
                                o.id,
                                "opacity",
                                e,
                                value,
                              )
                            }
                            valueLabelDisplay="auto"
                            valueLabelFormat={(v) => v + "%"}
                            aria-labelledby="overlay-opacity-slider"
                          />
                        </Grid>
                        <Grid item>
                          <Tooltip disableInteractive title="Remove Overlay">
                            <IconButton
                              onClick={() => this.onRemoveOverlay(o.id)}
                              size="large"
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </FullWidthCollapse>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  p: !this.props.scene.overlayEnabled
                    ? "0 !important"
                    : undefined,
                }}
              >
                <FullWidthCollapse in={this.props.scene.overlayEnabled}>
                  <Divider />
                </FullWidthCollapse>
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
    );
  }

  onAddOverlay = () => {
    let id = this.props.scene.overlays.length + 1;
    this.props.scene.overlays.forEach((o) => {
      id = Math.max(o.id + 1, id);
    });
    const newOverlays = this.props.scene.overlays.concat([
      new Overlay({ id: id }),
    ]);
    this.update((s) => {
      s.overlays = newOverlays;
    });
  };

  onRemoveOverlay = (id: number) => {
    const newOverlays = Array.from(this.props.scene.overlays);
    newOverlays.splice(newOverlays.map((o) => o.id).indexOf(id), 1);
    this.update((s) => {
      s.overlays = newOverlays;
    });
  };

  getSceneName = (id: string): string => {
    if (id === "0") return "None";
    if (id === "-1") return "Random";

    let sceneName;
    if (id.startsWith("999")) {
      const gridID = id.replace("999", "");
      sceneName = this.props.allSceneGrids.find(
        (s) => s.id.toString() == gridID,
      )?.name;
    } else {
      sceneName = this.props.allScenes.find(
        (s) => s.id.toString() === id,
      )?.name;
    }

    return sceneName ?? "";
  };

  onOverlaySliderChange = (
    id: number,
    key: string,
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.changeOverlayKey(id, key, value);
  };

  changeOverlayKey(id: number, key: string, value: any) {
    this.update(
      (s) => (s.overlays.find((o: Overlay) => o.id == id)[key] = value),
    );
  }

  changeOverlayIntKey = (id: number, key: string, intString: string) => {
    const value = intString === "" ? "" : Number(intString);
    if (this.props.sidebar && this.props.onGenerate) {
      let overlay;
      if (intString.startsWith("999")) {
        intString = intString.replace("999", "");
        const gValue = intString === "" ? "" : Number(intString);
        overlay = this.props.allSceneGrids.find((s) => s.id == gValue);
      } else {
        overlay = this.props.allScenes.find((s) => s.id == value);
      }
      if (overlay != null) {
        this.props.onGenerate(overlay);
      }
    }
    this.changeOverlayKey(id, key, value);
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
    if (key == "timingSinRate") {
      this.setState({ timingSinRate: Number(value) });
    }
    if (key == "backForthSinRate") {
      this.setState({ backForthSinRate: Number(value) });
    }
  };

  onTimingSinRateChange = (
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ timingSinRate: value as number });
  };

  onBackForthSinRateChange = (
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    this.setState({ backForthSinRate: value as number });
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

  onInput(key: string, e: SelectChangeEvent<string>) {
    const input = e.target;
    this.changeKey(key, input.value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeIntKey = (key: string, intString: string) => {
    this.changeKey(key, intString === "" ? "" : Number(intString));
  };

  changeKey(key: string, value: any) {
    this.update((s) => (s[key] = value));
  }

  onRandomSceneDialog = () => {
    const randomSceneList =
      this.state.randomSceneList == null
        ? this.props.scene.nextSceneRandoms
        : undefined;
    this.setState({ randomSceneList });
  };

  changeRandomScenes = (sceneIDs: Array<number>) => {
    this.setState({ randomSceneList: sceneIDs });
  };

  onSelectNone = () => {
    this.setState({ randomSceneList: [] });
  };

  onSelectAll = () => {
    this.setState({ randomSceneList: this.props.allScenes.map((s) => s.id) });
  };

  onSaveRandomScene = () => {
    this.changeKey("nextSceneRandoms", this.state.randomSceneList);
    this.onRandomSceneDialog();
  };
}

export default SceneOptionCard;
