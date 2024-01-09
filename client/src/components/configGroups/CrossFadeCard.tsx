import * as React from 'react'
import clsx from 'clsx'

import { Collapse, Divider, Grid, type Theme } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { SDT } from 'flipflip-common'
import {
  selectAppTutorial,
  selectAppConfigDisplaySettingsEasingControls,
  selectAppLastRouteIsPlayer
} from '../../store/app/selectors'
import {
  setSceneFadeTF,
  setSceneFadeDuration,
  setSceneFadeDurationMin,
  setSceneFadeDurationMax,
  setSceneFadeSinRate,
  setSceneFadeBPMMulti,
  setSceneFadeExp,
  setSceneFadeOv,
  setSceneFadeAmp,
  setSceneFadePer,
  setSceneFadeEase,
  setSceneCrossFade,
  setSceneCrossFadeAudio
} from '../../store/scene/actions'
import {
  selectSceneHasBPM,
  selectSceneFadeAmp,
  selectSceneFadeExp,
  selectSceneFadeOv,
  selectSceneFadePer,
  selectSceneFadeBPMMulti,
  selectSceneFadeDuration,
  selectSceneFadeDurationMax,
  selectSceneFadeDurationMin,
  selectSceneFadeSinRate,
  selectSceneFadeTF,
  selectSceneFadeEase,
  selectSceneCrossFade,
  selectSceneCrossFadeAudio
} from '../../store/scene/selectors'
import BaseSwitch from '../common/BaseSwitch'
import TimingCard from '../common/TimingCard'
import EasingCard from '../common/EasingCard'
import { useAppSelector } from '../../store/hooks'

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

export interface CrossFadeCardProps extends WithStyles<typeof styles> {
  sceneID?: number
}

function CrossFadeCard(props: CrossFadeCardProps) {
  const classes = props.classes
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const tutorial = useAppSelector(selectAppTutorial())
  const easingControls = useAppSelector(
    selectAppConfigDisplaySettingsEasingControls()
  )
  const crossFade = useAppSelector(selectSceneCrossFade(props.sceneID))

  return (
    <Grid container spacing={crossFade ? 2 : 0} alignItems="center">
      <Grid
        item
        xs={12}
        className={clsx(
          tutorial != null && tutorial !== SDT.fade1 && classes.disable
        )}
      >
        <Grid container alignItems="center">
          <Grid item xs={12} sm={sidebar ? 12 : 5}>
            <BaseSwitch
              label="Cross-Fade"
              selector={selectSceneCrossFade(props.sceneID)}
              action={setSceneCrossFade(props.sceneID)}
            />
          </Grid>
          <Grid item xs={12} sm={sidebar ? 12 : 7}>
            <Collapse
              in={crossFade}
              className={clsx(classes.fullWidth, classes.paddingLeft)}
            >
              <BaseSwitch
                label="Cross-Fade Audio"
                size="small"
                selector={selectSceneCrossFadeAudio(props.sceneID)}
                action={setSceneCrossFadeAudio(props.sceneID)}
              />
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={crossFade} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid
        item
        xs={12}
        className={clsx(
          tutorial != null && classes.disable,
          tutorial === SDT.fade2 && classes.highlight
        )}
      >
        <Collapse in={crossFade} className={classes.fullWidth}>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={selectSceneHasBPM(props.sceneID)}
            timing={{
              selector: selectSceneFadeTF(props.sceneID),
              action: setSceneFadeTF(props.sceneID)
            }}
            duration={{
              selector: selectSceneFadeDuration(props.sceneID),
              action: setSceneFadeDuration(props.sceneID)
            }}
            durationMin={{
              selector: selectSceneFadeDurationMin(props.sceneID),
              action: setSceneFadeDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: selectSceneFadeDurationMax(props.sceneID),
              action: setSceneFadeDurationMax(props.sceneID)
            }}
            wave={{
              selector: selectSceneFadeSinRate(props.sceneID),
              action: setSceneFadeSinRate(props.sceneID),
              labelledBy: 'fade-sin-rate-slider'
            }}
            bpm={{
              selector: selectSceneFadeBPMMulti(props.sceneID),
              action: setSceneFadeBPMMulti(props.sceneID),
              labelledBy: 'fade-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid>
      {easingControls && (
        <React.Fragment>
          <Grid item xs={12}>
            <Collapse in={crossFade} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid>
          <Grid item xs={12}>
            <Collapse in={crossFade} className={classes.fullWidth}>
              <EasingCard
                sidebar={sidebar}
                easing={{
                  selector: selectSceneFadeEase(props.sceneID),
                  action: setSceneFadeEase(props.sceneID)
                }}
                exponent={{
                  selector: selectSceneFadeExp(props.sceneID),
                  action: setSceneFadeExp(props.sceneID),
                  labelledBy: 'fade-exp-slider'
                }}
                overshoot={{
                  selector: selectSceneFadeOv(props.sceneID),
                  action: setSceneFadeOv(props.sceneID),
                  labelledBy: 'fade-ov-slider'
                }}
                amplitude={{
                  selector: selectSceneFadeAmp(props.sceneID),
                  action: setSceneFadeAmp(props.sceneID),
                  labelledBy: 'fade-amp-slider'
                }}
                period={{
                  selector: selectSceneFadePer(props.sceneID),
                  action: setSceneFadePer(props.sceneID),
                  labelledBy: 'fade-per-slider'
                }}
              />
            </Collapse>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  )
}

;(CrossFadeCard as any).displayName = 'CrossFadeCard'
export default withStyles(styles)(CrossFadeCard as any)
