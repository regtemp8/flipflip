import * as React from 'react'
import clsx from 'clsx'

import { Collapse, Divider, Grid, type Theme } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import TimingCard from '../common/TimingCard'
import { useAppSelector } from '../../store/hooks'
import {
  selectAppTutorial,
  selectAppConfigDisplaySettingsEasingControls,
  selectAppLastRouteIsPlayer
} from '../../store/app/selectors'
import {
  setSceneFadeInOut,
  setSceneFadeIOTF,
  setSceneFadeIODuration,
  setSceneFadeIODurationMin,
  setSceneFadeIODurationMax,
  setSceneFadeIOSinRate,
  setSceneFadeIOBPMMulti,
  setSceneFadeIOStartExp,
  setSceneFadeIOStartOv,
  setSceneFadeIOStartAmp,
  setSceneFadeIOStartPer,
  setSceneFadeIOEndExp,
  setSceneFadeIOEndOv,
  setSceneFadeIOEndAmp,
  setSceneFadeIOEndPer,
  setSceneFadeIOStartEase,
  setSceneFadeIOEndEase
} from '../../store/scene/actions'
import {
  selectSceneHasBPM,
  selectSceneFadeInOut,
  selectSceneFadeIOStartAmp,
  selectSceneFadeIOStartExp,
  selectSceneFadeIOStartOv,
  selectSceneFadeIOStartPer,
  selectSceneFadeIOEndAmp,
  selectSceneFadeIOEndExp,
  selectSceneFadeIOEndOv,
  selectSceneFadeIOEndPer,
  selectSceneFadeIOBPMMulti,
  selectSceneFadeIODuration,
  selectSceneFadeIODurationMax,
  selectSceneFadeIODurationMin,
  selectSceneFadeIOSinRate,
  selectSceneFadeIOTF,
  selectSceneFadeIOStartEase,
  selectSceneFadeIOEndEase
} from '../../store/scene/selectors'
import EasingCard from '../common/EasingCard'
import BaseSwitch from '../common/BaseSwitch'

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
  })

export interface FadeIOCardProps extends WithStyles<typeof styles> {
  sceneID?: number
}

function FadeIOCard(props: FadeIOCardProps) {
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const fadeInOut = useAppSelector(selectSceneFadeInOut(props.sceneID))
  const tutorial = useAppSelector(selectAppTutorial())
  const easingControls = useAppSelector(
    selectAppConfigDisplaySettingsEasingControls()
  )

  const classes = props.classes
  return (
    <Grid
      container
      spacing={fadeInOut ? 2 : 0}
      alignItems="center"
      className={clsx(tutorial != null && classes.disable)}
    >
      <Grid item xs={12}>
        <BaseSwitch
          label="Fade In/Out"
          selector={selectSceneFadeInOut(props.sceneID)}
          action={setSceneFadeInOut(props.sceneID)}
        />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={fadeInOut} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={fadeInOut} className={classes.fullWidth}>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={selectSceneHasBPM(props.sceneID)}
            timing={{
              selector: selectSceneFadeIOTF(props.sceneID),
              action: setSceneFadeIOTF(props.sceneID)
            }}
            duration={{
              selector: selectSceneFadeIODuration(props.sceneID),
              action: setSceneFadeIODuration(props.sceneID)
            }}
            durationMin={{
              selector: selectSceneFadeIODurationMin(props.sceneID),
              action: setSceneFadeIODurationMin(props.sceneID)
            }}
            durationMax={{
              selector: selectSceneFadeIODurationMax(props.sceneID),
              action: setSceneFadeIODurationMax(props.sceneID)
            }}
            wave={{
              selector: selectSceneFadeIOSinRate(props.sceneID),
              action: setSceneFadeIOSinRate(props.sceneID),
              labelledBy: 'fadeio-sin-rate-slider'
            }}
            bpm={{
              selector: selectSceneFadeIOBPMMulti(props.sceneID),
              action: setSceneFadeIOBPMMulti(props.sceneID),
              labelledBy: 'fadeio-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid>
      {easingControls && (
        <React.Fragment>
          <Grid item xs={12}>
            <Collapse in={fadeInOut} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid>
          <Grid item xs={12}>
            <Collapse in={fadeInOut} className={classes.fullWidth}>
              <EasingCard
                label="Start Easing"
                sidebar={sidebar}
                easing={{
                  selector: selectSceneFadeIOStartEase(props.sceneID),
                  action: setSceneFadeIOStartEase(props.sceneID)
                }}
                exponent={{
                  selector: selectSceneFadeIOStartExp(props.sceneID),
                  action: setSceneFadeIOStartExp(props.sceneID),
                  labelledBy: 'fadeio-start-exp-slider'
                }}
                overshoot={{
                  selector: selectSceneFadeIOStartOv(props.sceneID),
                  action: setSceneFadeIOStartOv(props.sceneID),
                  labelledBy: 'fadeio-start-ov-slider'
                }}
                amplitude={{
                  selector: selectSceneFadeIOStartAmp(props.sceneID),
                  action: setSceneFadeIOStartAmp(props.sceneID),
                  labelledBy: 'fadeio-start-amp-slider'
                }}
                period={{
                  selector: selectSceneFadeIOStartPer(props.sceneID),
                  action: setSceneFadeIOStartPer(props.sceneID),
                  labelledBy: 'fadeio-start-per-slider'
                }}
              />
              <EasingCard
                label="End Easing"
                sidebar={sidebar}
                easing={{
                  selector: selectSceneFadeIOEndEase(props.sceneID),
                  action: setSceneFadeIOEndEase(props.sceneID)
                }}
                exponent={{
                  selector: selectSceneFadeIOEndExp(props.sceneID),
                  action: setSceneFadeIOEndExp(props.sceneID),
                  labelledBy: 'fadeio-end-exp-slider'
                }}
                overshoot={{
                  selector: selectSceneFadeIOEndOv(props.sceneID),
                  action: setSceneFadeIOEndOv(props.sceneID),
                  labelledBy: 'fadeio-end-ov-slider'
                }}
                amplitude={{
                  selector: selectSceneFadeIOEndAmp(props.sceneID),
                  action: setSceneFadeIOEndAmp(props.sceneID),
                  labelledBy: 'fadeio-end-amp-slider'
                }}
                period={{
                  selector: selectSceneFadeIOEndPer(props.sceneID),
                  action: setSceneFadeIOEndPer(props.sceneID),
                  labelledBy: 'fadeio-end-per-slider'
                }}
              />
            </Collapse>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  )
}

;(FadeIOCard as any).displayName = 'FadeIOCard'
export default withStyles(styles)(FadeIOCard as any)
