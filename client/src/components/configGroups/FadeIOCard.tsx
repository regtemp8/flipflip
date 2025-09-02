import { cx } from '@emotion/css'

import { Collapse, Divider, Grid2, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import TimingCard from '../common/TimingCard'
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
} from '../../store/api/thunks'
import {
  useGetSceneFadeInOutQuery,
  useGetSceneFadeIOStartAmpQuery,
  useGetSceneFadeIOStartExpQuery,
  useGetSceneFadeIOStartOvQuery,
  useGetSceneFadeIOStartPerQuery,
  useGetSceneFadeIOEndAmpQuery,
  useGetSceneFadeIOEndExpQuery,
  useGetSceneFadeIOEndOvQuery,
  useGetSceneFadeIOEndPerQuery,
  useGetSceneFadeIOBPMMultiQuery,
  useGetSceneFadeIODurationQuery,
  useGetSceneFadeIODurationMaxQuery,
  useGetSceneFadeIODurationMinQuery,
  useGetSceneFadeIOSinRateQuery,
  useGetSceneFadeIOTFQuery,
  useGetSceneFadeIOStartEaseQuery,
  useGetSceneFadeIOEndEaseQuery,
  useGetDisplaySettingsEasingControlsQuery
} from '../../store/api/selectors'
import {
  useGetSceneHasBPMQuery,
  useGetTutorialsQuery
} from '../../store/api/slice'
import EasingCard from '../common/EasingCard'
import BaseSwitch from '../common/BaseSwitch'
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

export interface FadeIOCardProps {
  sceneID: number
}

function FadeIOCard(props: FadeIOCardProps) {
  const sidebar = useIsPlayerRoute()
  const { data: tutorial } = useGetTutorialsQuery()
  const { data: easingControls } = useGetDisplaySettingsEasingControlsQuery()
  const { data: fadeInOut } = useGetSceneFadeInOutQuery(props.sceneID)

  const { classes } = useStyles()
  return (
    <Grid2
      container
      spacing={fadeInOut ? 2 : 0}
      alignItems="center"
      className={cx(tutorial?.current != null && classes.disable)}
    >
      <Grid2 size={12}>
        <BaseSwitch
          label="Fade In/Out"
          selector={() => useGetSceneFadeInOutQuery(props.sceneID)}
          action={setSceneFadeInOut(props.sceneID)}
        />
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={fadeInOut} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={fadeInOut} className={classes.fullWidth}>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={() => useGetSceneHasBPMQuery(props.sceneID)}
            timing={{
              selector: () => useGetSceneFadeIOTFQuery(props.sceneID),
              action: setSceneFadeIOTF(props.sceneID)
            }}
            duration={{
              selector: () => useGetSceneFadeIODurationQuery(props.sceneID),
              action: setSceneFadeIODuration(props.sceneID)
            }}
            durationMin={{
              selector: () => useGetSceneFadeIODurationMinQuery(props.sceneID),
              action: setSceneFadeIODurationMin(props.sceneID)
            }}
            durationMax={{
              selector: () => useGetSceneFadeIODurationMaxQuery(props.sceneID),
              action: setSceneFadeIODurationMax(props.sceneID)
            }}
            wave={{
              selector: () => useGetSceneFadeIOSinRateQuery(props.sceneID),
              action: setSceneFadeIOSinRate(props.sceneID),
              labelledBy: 'fadeio-sin-rate-slider'
            }}
            bpm={{
              selector: () => useGetSceneFadeIOBPMMultiQuery(props.sceneID),
              action: setSceneFadeIOBPMMulti(props.sceneID),
              labelledBy: 'fadeio-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid2>
      {easingControls && (
        <>
          <Grid2 size={12}>
            <Collapse in={fadeInOut} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid2>
          <Grid2 size={12}>
            <Collapse in={fadeInOut} className={classes.fullWidth}>
              <EasingCard
                label="Start Easing"
                sidebar={sidebar}
                easing={{
                  selector: () =>
                    useGetSceneFadeIOStartEaseQuery(props.sceneID),
                  action: setSceneFadeIOStartEase(props.sceneID)
                }}
                exponent={{
                  selector: () => useGetSceneFadeIOStartExpQuery(props.sceneID),
                  action: setSceneFadeIOStartExp(props.sceneID),
                  labelledBy: 'fadeio-start-exp-slider'
                }}
                overshoot={{
                  selector: () => useGetSceneFadeIOStartOvQuery(props.sceneID),
                  action: setSceneFadeIOStartOv(props.sceneID),
                  labelledBy: 'fadeio-start-ov-slider'
                }}
                amplitude={{
                  selector: () => useGetSceneFadeIOStartAmpQuery(props.sceneID),
                  action: setSceneFadeIOStartAmp(props.sceneID),
                  labelledBy: 'fadeio-start-amp-slider'
                }}
                period={{
                  selector: () => useGetSceneFadeIOStartPerQuery(props.sceneID),
                  action: setSceneFadeIOStartPer(props.sceneID),
                  labelledBy: 'fadeio-start-per-slider'
                }}
              />
              <EasingCard
                label="End Easing"
                sidebar={sidebar}
                easing={{
                  selector: () => useGetSceneFadeIOEndEaseQuery(props.sceneID),
                  action: setSceneFadeIOEndEase(props.sceneID)
                }}
                exponent={{
                  selector: () => useGetSceneFadeIOEndExpQuery(props.sceneID),
                  action: setSceneFadeIOEndExp(props.sceneID),
                  labelledBy: 'fadeio-end-exp-slider'
                }}
                overshoot={{
                  selector: () => useGetSceneFadeIOEndOvQuery(props.sceneID),
                  action: setSceneFadeIOEndOv(props.sceneID),
                  labelledBy: 'fadeio-end-ov-slider'
                }}
                amplitude={{
                  selector: () => useGetSceneFadeIOEndAmpQuery(props.sceneID),
                  action: setSceneFadeIOEndAmp(props.sceneID),
                  labelledBy: 'fadeio-end-amp-slider'
                }}
                period={{
                  selector: () => useGetSceneFadeIOEndPerQuery(props.sceneID),
                  action: setSceneFadeIOEndPer(props.sceneID),
                  labelledBy: 'fadeio-end-per-slider'
                }}
              />
            </Collapse>
          </Grid2>
        </>
      )}
    </Grid2>
  )
}

;(FadeIOCard as any).displayName = 'FadeIOCard'
export default FadeIOCard
