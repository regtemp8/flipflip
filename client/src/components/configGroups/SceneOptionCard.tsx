import React from 'react'
import { cx } from '@emotion/css'
import { Collapse, Divider, Grid, MenuItem, type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

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
  setSceneTimingBPMMulti,
  setSceneTimingDuration,
  setSceneTimingDurationMax,
  setSceneTimingDurationMin,
  setSceneTimingSinRate,
  setSceneTimingTF
} from '../../store/scene/actions'
import { useAppSelector } from '../../store/hooks'
import {
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
import TimingCard from '../common/TimingCard'
import ColorPicker from '../config/ColorPicker'
import ColorSetPicker from '../config/ColorSetPicker'

const useStyles = makeStyles()((theme: Theme) => ({
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
}))

export interface SceneOptionCardProps {
  isTagging?: boolean
  sceneID?: number
}

function SceneOptionCard(props: SceneOptionCardProps) {
  const tutorial = useAppSelector(selectAppTutorial())
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const backForth = useAppSelector(selectSceneBackForth(props.sceneID))
  const backgroundType = useAppSelector(
    selectSceneBackgroundType(props.sceneID)
  )

  const { classes } = useStyles()
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid
        item
        xs={12}
        className={cx(tutorial === SDT.timing && classes.highlight)}
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
        className={cx(tutorial === SDT.backForth && classes.highlight)}
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
        className={cx(tutorial === SDT.imageSizing && classes.highlight)}
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
    </Grid>
  )
}

;(SceneOptionCard as any).displayName = 'SceneOptionCard'
export default SceneOptionCard
