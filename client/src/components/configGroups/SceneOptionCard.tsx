import React, { useState } from 'react'
import clsx from 'clsx'
import AddIcon from '@mui/icons-material/Add'
import ListIcon from '@mui/icons-material/List'
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  Fab,
  Grid,
  IconButton,
  MenuItem,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'
import { addOverlay, removeOverlay } from '../../store/overlay/thunks'
import {
  setSceneBackForth,
  setSceneBackForthBPMMulti,
  setSceneBackForthDuration,
  setSceneBackForthDurationMax,
  setSceneBackForthDurationMin,
  setSceneBackForthSinRate,
  setSceneBackForthTF,
  setSceneBackgroundBlur,
  setSceneBackgroundColor,
  setSceneBackgroundColorSet,
  setSceneBackgroundType,
  setSceneImageType,
  setSceneNextSceneAllImages,
  setSceneNextSceneTime,
  setSceneOverlayEnabled,
  setScenePersistAudio,
  setScenePersistText,
  setSceneTimingBPMMulti,
  setSceneTimingDuration,
  setSceneTimingDurationMax,
  setSceneTimingDurationMin,
  setSceneTimingSinRate,
  setSceneTimingTF,
  setSceneNextSceneRandoms,
  setSceneNextSceneID
} from '../../store/scene/actions'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectAppScenes,
  selectAppLastRouteIsPlayer,
  selectAppTutorial
} from '../../store/app/selectors'
import {
  selectSceneBackForth,
  selectSceneBackForthBPMMulti,
  selectSceneBackForthDuration,
  selectSceneBackForthDurationMax,
  selectSceneBackForthDurationMin,
  selectSceneBackForthSinRate,
  selectSceneBackForthTF,
  selectSceneBackgroundBlur,
  selectSceneBackgroundColor,
  selectSceneBackgroundColorSet,
  selectSceneBackgroundType,
  selectSceneHasBPM,
  selectSceneImageType,
  selectSceneNextSceneID,
  selectSceneNextSceneRandoms,
  selectSceneNextSceneAllImages,
  selectSceneNextSceneTime,
  selectSceneOverlays,
  selectSceneOverlayEnabled,
  selectScenePersistAudio,
  selectScenePersistText,
  selectSceneTimingBPMMulti,
  selectSceneTimingDuration,
  selectSceneTimingDurationMax,
  selectSceneTimingDurationMin,
  selectSceneTimingSinRate,
  selectSceneTimingTF
} from '../../store/scene/selectors'
import { en, BT, IT, SDT } from 'flipflip-common'
import BaseSelect from '../common/BaseSelect'
import BaseSwitch from '../common/BaseSwitch'
import BaseSlider from '../common/slider/BaseSlider'
import MillisTextField from '../common/text/MillisTextField'
import TimingCard from '../common/TimingCard'
import ColorPicker from '../config/ColorPicker'
import ColorSetPicker from '../config/ColorSetPicker'
import MultiSceneSelect from './MultiSceneSelect'
import SceneSelect from './SceneSelect'
import OverlayCard from './OverlayCard'

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: '100%'
    },
    paddingLeft: {
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(1)
      }
    },
    noPadding: {
      padding: '0 !important'
    },
    noTopPadding: {
      paddingTop: '0 !important'
    },
    selectOffset: {
      paddingTop: '10px !important',
      paddingBottom: '0 !important'
    },
    endInput: {
      paddingLeft: theme.spacing(1),
      paddingTop: 0
    },
    percentInput: {
      minWidth: theme.spacing(11)
    },
    addButton: {
      boxShadow: 'none'
    },
    backdropTop: {
      zIndex: theme.zIndex.modal + 1
    },
    highlight: {
      borderWidth: 2,
      borderColor: theme.palette.secondary.main,
      borderStyle: 'solid'
    },
    disable: {
      pointerEvents: 'none'
    },
    randomScene: {
      display: 'block'
    },
    selectText: {
      color: theme.palette.text.secondary
    },
    error: {
      color: theme.palette.error.main
    },
    noScroll: {
      overflow: 'visible'
    },
    randomSceneDialog: {
      minWidth: 400,
      overflow: 'visible'
    },
    noBPM: {
      float: 'right'
    }
  })

export interface SceneOptionCardProps extends WithStyles<typeof styles> {
  isTagging?: boolean
  sceneID?: number
}

function SceneOptionCard(props: SceneOptionCardProps) {
  const [randomSceneList, setRandomSceneList] = useState<number[]>()

  const dispatch = useAppDispatch()
  const scenes = useAppSelector(selectAppScenes())
  const tutorial = useAppSelector(selectAppTutorial())
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const backForth = useAppSelector(selectSceneBackForth(props.sceneID))
  const nextSceneID = useAppSelector(selectSceneNextSceneID(props.sceneID))
  const nextSceneRandoms = useAppSelector(
    selectSceneNextSceneRandoms(props.sceneID)
  )
  const nextSceneAllImages = useAppSelector(
    selectSceneNextSceneAllImages(props.sceneID)
  )
  const overlays = useAppSelector(selectSceneOverlays(props.sceneID))
  const overlayEnabled = useAppSelector(
    selectSceneOverlayEnabled(props.sceneID)
  )
  const backgroundType = useAppSelector(
    selectSceneBackgroundType(props.sceneID)
  )

  const onAddOverlay = () => {
    dispatch(addOverlay(props.sceneID))
  }

  const onRandomSceneDialog = () => {
    if (randomSceneList) {
      setRandomSceneList(undefined)
    } else {
      setRandomSceneList(nextSceneRandoms)
    }
  }

  const changeRandomScenes = (sceneIDs: number[]) => {
    setRandomSceneList(sceneIDs)
  }

  const onSelectNone = () => {
    setRandomSceneList([])
  }

  const onSelectAll = () => {
    setRandomSceneList(scenes)
  }

  const onSaveRandomScene = () => {
    dispatch(setSceneNextSceneRandoms(nextSceneRandoms, props.sceneID))
    onRandomSceneDialog()
  }

  const classes = props.classes
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid
        item
        xs={12}
        className={clsx(tutorial === SDT.timing && classes.highlight)}
      >
        <TimingCard
          excludeScene={true}
          sidebar={sidebar}
          hasBPMSelector={selectSceneHasBPM(props.sceneID)}
          timing={{
            selector: selectSceneTimingTF(props.sceneID),
            action: setSceneTimingTF(props.sceneID)
          }}
          duration={{
            selector: selectSceneTimingDuration(props.sceneID),
            action: setSceneTimingDuration(props.sceneID)
          }}
          durationMin={{
            selector: selectSceneTimingDurationMin(props.sceneID),
            action: setSceneTimingDurationMin(props.sceneID)
          }}
          durationMax={{
            selector: selectSceneTimingDurationMax(props.sceneID),
            action: setSceneTimingDurationMax(props.sceneID)
          }}
          wave={{
            selector: selectSceneTimingSinRate(props.sceneID),
            action: setSceneTimingSinRate(props.sceneID),
            labelledBy: 'scene-sin-rate-slider'
          }}
          bpm={{
            selector: selectSceneTimingBPMMulti(props.sceneID),
            action: setSceneTimingBPMMulti(props.sceneID),
            labelledBy: 'scene-bpm-multi-slider'
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid
        item
        xs={12}
        className={clsx(tutorial === SDT.backForth && classes.highlight)}
      >
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <BaseSwitch
              label="Back/Forth"
              tooltip="Go back and forth between the last two images"
              selector={selectSceneBackForth(props.sceneID)}
              action={setSceneBackForth(props.sceneID)}
            />
          </Grid>
        </Grid>
        <Collapse in={backForth}>
          <TimingCard
            label="Back/Forth Timing"
            excludeScene={true}
            sidebar={sidebar}
            hasBPMSelector={selectSceneHasBPM(props.sceneID)}
            timing={{
              selector: selectSceneBackForthTF(props.sceneID),
              action: setSceneBackForthTF(props.sceneID)
            }}
            duration={{
              selector: selectSceneBackForthDuration(props.sceneID),
              action: setSceneBackForthDuration(props.sceneID)
            }}
            durationMin={{
              selector: selectSceneBackForthDurationMin(props.sceneID),
              action: setSceneBackForthDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: selectSceneBackForthDurationMax(props.sceneID),
              action: setSceneBackForthDurationMax(props.sceneID)
            }}
            wave={{
              selector: selectSceneBackForthSinRate(props.sceneID),
              action: setSceneBackForthSinRate(props.sceneID),
              labelledBy: 'bf-sin-rate-slider'
            }}
            bpm={{
              selector: selectSceneBackForthBPMMulti(props.sceneID),
              action: setSceneBackForthBPMMulti(props.sceneID),
              labelledBy: 'bf-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid
        item
        xs={12}
        className={clsx(tutorial === SDT.imageSizing && classes.highlight)}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={sidebar ? 8 : 12} sm={sidebar ? 8 : 6}>
            <BaseSelect
              label="Image Sizing"
              controlClassName={classes.fullWidth}
              selector={selectSceneImageType(props.sceneID)}
              action={setSceneImageType(props.sceneID)}
            >
              {Object.values(IT).map((it) => (
                <MenuItem key={it} value={it}>
                  {en.get(it)}
                </MenuItem>
              ))}
            </BaseSelect>
          </Grid>
          <Grid item xs={12} sm={sidebar ? 12 : 6} />
          <Grid item xs={sidebar ? 8 : 12} sm={sidebar ? 8 : 4}>
            <BaseSelect
              label="Background"
              controlClassName={classes.fullWidth}
              selector={selectSceneBackgroundType(props.sceneID)}
              action={setSceneBackgroundType(props.sceneID)}
            >
              {Object.values(BT).map((bt) => (
                <MenuItem key={bt} value={bt}>
                  {en.get(bt)}
                </MenuItem>
              ))}
            </BaseSelect>
          </Grid>
          <Grid item xs={12} sm={sidebar ? 12 : 8}>
            <Collapse
              in={backgroundType === BT.blur}
              className={classes.fullWidth}
            >
              <BaseSlider
                min={0}
                max={30}
                selector={selectSceneBackgroundBlur(props.sceneID)}
                action={setSceneBackgroundBlur(props.sceneID)}
                format={{ type: 'pixel' }}
                labelledBy="scene-bg-color-slider"
                label={{ text: 'Blur:', appendValue: true }}
              />
            </Collapse>
            <Collapse
              in={backgroundType === BT.color}
              className={classes.fullWidth}
            >
              {backgroundType === BT.color && (
                <ColorPicker
                  selector={selectSceneBackgroundColor(props.sceneID)}
                  action={setSceneBackgroundColor(props.sceneID)}
                />
              )}
            </Collapse>
            <Collapse
              in={backgroundType === BT.colorSet}
              className={classes.fullWidth}
            >
              {backgroundType === BT.colorSet && (
                <ColorSetPicker
                  selector={selectSceneBackgroundColorSet(props.sceneID)}
                  action={setSceneBackgroundColorSet(props.sceneID)}
                />
              )}
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
      {!props.isTagging && (
        <React.Fragment>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid
            item
            xs={12}
            className={clsx(tutorial === SDT.nextScene && classes.highlight)}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid
                item
                className={classes.noTopPadding}
                xs={nextSceneID === -1 ? 10 : 12}
                sm={nextSceneID === -1 ? (sidebar ? 10 : 5) : sidebar ? 12 : 7}
              >
                <Typography className={classes.selectText} variant="caption">
                  Next Scene
                </Typography>
                <SceneSelect
                  value={nextSceneID}
                  includeExtra
                  onChange={(nextSceneID: number) =>
                    dispatch(setSceneNextSceneID(nextSceneID, props.sceneID))
                  }
                />
                <Dialog
                  classes={{ paper: classes.randomSceneDialog }}
                  open={!!randomSceneList}
                  onClose={onRandomSceneDialog}
                  aria-describedby="random-scene-description"
                >
                  <DialogContent classes={{ root: classes.noScroll }}>
                    <DialogContentText id="random-scene-description">
                      Select which scenes to include:
                    </DialogContentText>
                    <MultiSceneSelect
                      values={randomSceneList}
                      onChange={changeRandomScenes}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={onSelectNone}>Select None</Button>
                    <Button onClick={onSelectAll}>Select All</Button>
                  </DialogActions>
                  <DialogActions>
                    <Button onClick={onRandomSceneDialog} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={onSaveRandomScene} color="primary">
                      Save
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
              {nextSceneID === -1 && (
                <Grid item className={classes.selectOffset}>
                  <Tooltip
                    disableInteractive
                    title={
                      nextSceneRandoms.length === 0
                        ? 'Select Scenes (EMPTY)'
                        : 'Select Scenes'
                    }
                  >
                    <IconButton
                      className={clsx(
                        nextSceneRandoms.length === 0 && classes.error
                      )}
                      onClick={onRandomSceneDialog}
                      size="large"
                    >
                      <ListIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
              <Grid
                item
                className={classes.selectOffset}
                xs={12}
                sm={sidebar ? 12 : 5}
              >
                <Collapse in={nextSceneID !== 0 && !nextSceneAllImages}>
                  <MillisTextField
                    label="Play after"
                    selector={selectSceneNextSceneTime(props.sceneID)}
                    action={setSceneNextSceneTime(props.sceneID)}
                  />
                </Collapse>
              </Grid>
              <Grid item xs>
                <Collapse in={nextSceneID !== 0}>
                  <BaseSwitch
                    label="Play After All Images"
                    selector={selectSceneNextSceneAllImages(props.sceneID)}
                    action={setSceneNextSceneAllImages(props.sceneID)}
                  />
                </Collapse>
              </Grid>
              {!sidebar && (
                <React.Fragment>
                  <Grid item xs>
                    <Collapse in={nextSceneID !== 0}>
                      <BaseSwitch
                        label="Persist Audio"
                        selector={selectScenePersistAudio(props.sceneID)}
                        action={setScenePersistAudio(props.sceneID)}
                      />
                    </Collapse>
                  </Grid>
                  <Grid item xs>
                    <Collapse in={nextSceneID !== 0}>
                      <BaseSwitch
                        label="Persist Text Overlay"
                        selector={selectScenePersistText(props.sceneID)}
                        action={setScenePersistText(props.sceneID)}
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
        className={clsx(tutorial === SDT.overlays && classes.highlight)}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <BaseSwitch
              label="Overlays"
              selector={selectSceneOverlayEnabled(props.sceneID)}
              action={setSceneOverlayEnabled(props.sceneID)}
            />
          </Grid>
          <Grid item>
            <Collapse in={overlayEnabled}>
              <Fab
                className={classes.addButton}
                onClick={onAddOverlay}
                size="small"
              >
                <AddIcon />
              </Fab>
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
      {overlays.map((overlayID) => {
        return (
          <OverlayCard
            key={overlayID}
            enabled={overlayEnabled}
            overlayID={overlayID}
            onRemove={() => {
              dispatch(removeOverlay(overlayID, props.sceneID))
            }}
          />
        )
      })}
    </Grid>
  )
}

;(SceneOptionCard as any).displayName = 'SceneOptionCard'
export default withStyles(styles)(SceneOptionCard as any)
