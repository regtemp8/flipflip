import * as React from 'react'
import { cx } from '@emotion/css'

import { Collapse, Divider, Grid, MenuItem, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { en, STF } from 'flipflip-common'
import TimingCard from '../common/TimingCard'
import EasingCard from '../common/EasingCard'
import BaseSelect from '../common/BaseSelect'
import {
  selectAppTutorial,
  selectAppConfigDisplaySettingsEasingControls,
  selectAppLastRouteIsPlayer
} from '../../store/app/selectors'
import {
  setSceneSlide,
  setSceneSlideTF,
  setSceneSlideDuration,
  setSceneSlideDurationMin,
  setSceneSlideDurationMax,
  setSceneSlideSinRate,
  setSceneSlideBPMMulti,
  setSceneSlideEase,
  setSceneSlideExp,
  setSceneSlideOv,
  setSceneSlideAmp,
  setSceneSlidePer,
  setSceneSlideType,
  setSceneSlideDistance
} from '../../store/scene/actions'
import {
  selectSceneHasBPM,
  selectSceneSlide,
  selectSceneSlideTF,
  selectSceneSlideDuration,
  selectSceneSlideDurationMin,
  selectSceneSlideDurationMax,
  selectSceneSlideSinRate,
  selectSceneSlideBPMMulti,
  selectSceneSlideEase,
  selectSceneSlideExp,
  selectSceneSlideOv,
  selectSceneSlideAmp,
  selectSceneSlidePer,
  selectSceneSlideType,
  selectSceneSlideDistance
} from '../../store/scene/selectors'
import { useAppSelector } from '../../store/hooks'
import BaseSwitch from '../common/BaseSwitch'
import BaseSlider from '../common/slider/BaseSlider'

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%'
  },
  paddingLeft: {
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(1)
    }
  },
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0
  },
  percentInput: {
    minWidth: theme.spacing(11)
  },
  backdropTop: {
    zIndex: `${theme.zIndex.modal + 1} !important` as any
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid'
  },
  disable: {
    pointerEvents: 'none'
  }
}))

export interface SlideCardProps {
  sceneID?: number
}

function SlideCard(props: SlideCardProps) {
  const { classes } = useStyles()
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const slide = useAppSelector(selectSceneSlide(props.sceneID))
  const tutorial = useAppSelector(selectAppTutorial())
  const easingControls = useAppSelector(
    selectAppConfigDisplaySettingsEasingControls()
  )

  return (
    <Grid
      container
      spacing={slide ? 2 : 0}
      alignItems="center"
      className={cx(tutorial != null && classes.disable)}
    >
      <Grid item xs={12}>
        <BaseSwitch
          label="Slide"
          selector={selectSceneSlide(props.sceneID)}
          action={setSceneSlide(props.sceneID)}
        />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={slide} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={slide} className={classes.fullWidth}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={sidebar ? 12 : 4} style={{ paddingTop: 10 }}>
              <BaseSelect
                label="Direction"
                controlClassName={classes.fullWidth}
                selector={selectSceneSlideType(props.sceneID)}
                action={setSceneSlideType(props.sceneID)}
              >
                {Object.values(STF).map((tf) => (
                  <MenuItem key={tf} value={tf}>
                    {en.get(tf)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Grid>
            <Grid item xs={12} sm={sidebar ? 12 : 8}>
              <BaseSlider
                min={1}
                max={100}
                format={{ type: 'percent' }}
                label={{ text: 'Distance:', appendValue: true }}
                labelledBy="slide-distance-slider"
                selector={selectSceneSlideDistance(props.sceneID)}
                action={setSceneSlideDistance(props.sceneID)}
              />
            </Grid>
          </Grid>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={selectSceneHasBPM(props.sceneID)}
            timing={{
              selector: selectSceneSlideTF(props.sceneID),
              action: setSceneSlideTF(props.sceneID)
            }}
            duration={{
              selector: selectSceneSlideDuration(props.sceneID),
              action: setSceneSlideDuration(props.sceneID)
            }}
            durationMin={{
              selector: selectSceneSlideDurationMin(props.sceneID),
              action: setSceneSlideDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: selectSceneSlideDurationMax(props.sceneID),
              action: setSceneSlideDurationMax(props.sceneID)
            }}
            wave={{
              selector: selectSceneSlideSinRate(props.sceneID),
              action: setSceneSlideSinRate(props.sceneID),
              labelledBy: 'slide-sin-rate-slider'
            }}
            bpm={{
              selector: selectSceneSlideBPMMulti(props.sceneID),
              action: setSceneSlideBPMMulti(props.sceneID),
              labelledBy: 'slide-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid>
      {easingControls && (
        <React.Fragment>
          <Grid item xs={12}>
            <Collapse in={slide} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid>
          <Grid item xs={12}>
            <Collapse in={slide} className={classes.fullWidth}>
              <EasingCard
                sidebar={sidebar}
                easing={{
                  selector: selectSceneSlideEase(props.sceneID),
                  action: setSceneSlideEase(props.sceneID)
                }}
                exponent={{
                  selector: selectSceneSlideExp(props.sceneID),
                  action: setSceneSlideExp(props.sceneID),
                  labelledBy: 'slide-exp-slider'
                }}
                overshoot={{
                  selector: selectSceneSlideOv(props.sceneID),
                  action: setSceneSlideOv(props.sceneID),
                  labelledBy: 'slide-ov-slider'
                }}
                amplitude={{
                  selector: selectSceneSlideAmp(props.sceneID),
                  action: setSceneSlideAmp(props.sceneID),
                  labelledBy: 'slide-amp-slider'
                }}
                period={{
                  selector: selectSceneSlidePer(props.sceneID),
                  action: setSceneSlidePer(props.sceneID),
                  labelledBy: 'slide-per-slider'
                }}
              />
            </Collapse>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  )
}

;(SlideCard as any).displayName = 'SlideCard'
export default SlideCard
