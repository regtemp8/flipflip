import * as React from 'react'
import { cx } from '@emotion/css'

import { Collapse, Divider, Grid2, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { SDT } from 'flipflip-common'
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
} from '../../store/api/thunks'
import {
  useGetSceneFadeAmpQuery,
  useGetSceneFadeExpQuery,
  useGetSceneFadeOvQuery,
  useGetSceneFadePerQuery,
  useGetSceneFadeBPMMultiQuery,
  useGetSceneFadeDurationQuery,
  useGetSceneFadeDurationMaxQuery,
  useGetSceneFadeDurationMinQuery,
  useGetSceneFadeSinRateQuery,
  useGetSceneFadeTFQuery,
  useGetSceneFadeEaseQuery,
  useGetSceneCrossFadeQuery,
  useGetSceneCrossFadeAudioQuery,
  useGetDisplaySettingsEasingControlsQuery
} from '../../store/api/selectors'
import {
  useGetSceneHasBPMQuery,
  useGetTutorialsQuery
} from '../../store/api/slice'
import BaseSwitch from '../common/BaseSwitch'
import TimingCard from '../common/TimingCard'
import EasingCard from '../common/EasingCard'
import { useIsPlayerRoute } from '../useIsPlayerRoute'

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

export interface CrossFadeCardProps {
  sceneID: number
}

function CrossFadeCard(props: CrossFadeCardProps) {
  const { classes } = useStyles()
  const sidebar = useIsPlayerRoute()
  const { data: tutorial } = useGetTutorialsQuery()
  const { data: easingControls } = useGetDisplaySettingsEasingControlsQuery()
  const { data: crossFade } = useGetSceneCrossFadeQuery(props.sceneID)

  return (
    <Grid2 container spacing={crossFade ? 2 : 0} alignItems="center">
      <Grid2
        size={12}
        className={cx(
          tutorial?.current != null &&
            tutorial?.current !== SDT.fade1 &&
            classes.disable
        )}
      >
        <Grid2 container alignItems="center">
          <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 5 }}>
            <BaseSwitch
              label="Cross-Fade"
              selector={() => useGetSceneCrossFadeQuery(props.sceneID)}
              action={setSceneCrossFade(props.sceneID)}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 7 }}>
            <Collapse
              in={crossFade}
              className={cx(classes.fullWidth, classes.paddingLeft)}
            >
              <BaseSwitch
                label="Cross-Fade Audio"
                size="small"
                selector={() => useGetSceneCrossFadeAudioQuery(props.sceneID)}
                action={setSceneCrossFadeAudio(props.sceneID)}
              />
            </Collapse>
          </Grid2>
        </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={crossFade} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid2>
      <Grid2
        size={12}
        className={cx(
          tutorial?.current != null && classes.disable,
          tutorial?.current === SDT.fade2 && classes.highlight
        )}
      >
        <Collapse in={crossFade} className={classes.fullWidth}>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={() => useGetSceneHasBPMQuery(props.sceneID)}
            timing={{
              selector: () => useGetSceneFadeTFQuery(props.sceneID),
              action: setSceneFadeTF(props.sceneID)
            }}
            duration={{
              selector: () => useGetSceneFadeDurationQuery(props.sceneID),
              action: setSceneFadeDuration(props.sceneID)
            }}
            durationMin={{
              selector: () => useGetSceneFadeDurationMinQuery(props.sceneID),
              action: setSceneFadeDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: () => useGetSceneFadeDurationMaxQuery(props.sceneID),
              action: setSceneFadeDurationMax(props.sceneID)
            }}
            wave={{
              selector: () => useGetSceneFadeSinRateQuery(props.sceneID),
              action: setSceneFadeSinRate(props.sceneID),
              labelledBy: 'fade-sin-rate-slider'
            }}
            bpm={{
              selector: () => useGetSceneFadeBPMMultiQuery(props.sceneID),
              action: setSceneFadeBPMMulti(props.sceneID),
              labelledBy: 'fade-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid2>
      {easingControls && (
        <React.Fragment>
          <Grid2 size={12}>
            <Collapse in={crossFade} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid2>
          <Grid2 size={12}>
            <Collapse in={crossFade} className={classes.fullWidth}>
              <EasingCard
                sidebar={sidebar}
                easing={{
                  selector: () => useGetSceneFadeEaseQuery(props.sceneID),
                  action: setSceneFadeEase(props.sceneID)
                }}
                exponent={{
                  selector: () => useGetSceneFadeExpQuery(props.sceneID),
                  action: setSceneFadeExp(props.sceneID),
                  labelledBy: 'fade-exp-slider'
                }}
                overshoot={{
                  selector: () => useGetSceneFadeOvQuery(props.sceneID),
                  action: setSceneFadeOv(props.sceneID),
                  labelledBy: 'fade-ov-slider'
                }}
                amplitude={{
                  selector: () => useGetSceneFadeAmpQuery(props.sceneID),
                  action: setSceneFadeAmp(props.sceneID),
                  labelledBy: 'fade-amp-slider'
                }}
                period={{
                  selector: () => useGetSceneFadePerQuery(props.sceneID),
                  action: setSceneFadePer(props.sceneID),
                  labelledBy: 'fade-per-slider'
                }}
              />
            </Collapse>
          </Grid2>
        </React.Fragment>
      )}
    </Grid2>
  )
}

;(CrossFadeCard as any).displayName = 'CrossFadeCard'
export default CrossFadeCard
