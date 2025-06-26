import { cx } from '@emotion/css'

import { Collapse, Divider, Grid2, MenuItem, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { en, STF } from 'flipflip-common'
import TimingCard from '../common/TimingCard'
import EasingCard from '../common/EasingCard'
import BaseSelect from '../common/BaseSelect'
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
} from '../../store/api/thunks'
import {
  useGetSceneSlideQuery,
  useGetSceneSlideTFQuery,
  useGetSceneSlideDurationQuery,
  useGetSceneSlideDurationMinQuery,
  useGetSceneSlideDurationMaxQuery,
  useGetSceneSlideSinRateQuery,
  useGetSceneSlideBPMMultiQuery,
  useGetSceneSlideEaseQuery,
  useGetSceneSlideExpQuery,
  useGetSceneSlideOvQuery,
  useGetSceneSlideAmpQuery,
  useGetSceneSlidePerQuery,
  useGetSceneSlideTypeQuery,
  useGetSceneSlideDistanceQuery,
  useGetDisplaySettingsEasingControlsQuery
} from '../../store/api/selectors'
import {
  useGetSceneHasBPMQuery,
  useGetTutorialsQuery
} from '../../store/api/slice'
import BaseSwitch from '../common/BaseSwitch'
import BaseSlider from '../common/slider/BaseSlider'
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

export interface SlideCardProps {
  sceneID: number
}

function SlideCard(props: SlideCardProps) {
  const { classes } = useStyles()
  const sidebar = useIsPlayerRoute()
  const { data: slide } = useGetSceneSlideQuery(props.sceneID)
  const { data: tutorial } = useGetTutorialsQuery()
  const { data: easingControls } = useGetDisplaySettingsEasingControlsQuery()

  return (
    <Grid2
      container
      spacing={slide ? 2 : 0}
      alignItems="center"
      className={cx(tutorial?.current != null && classes.disable)}
    >
      <Grid2 size={12}>
        <BaseSwitch
          label="Slide"
          selector={() => useGetSceneSlideQuery(props.sceneID)}
          action={setSceneSlide(props.sceneID)}
        />
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={slide} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={slide} className={classes.fullWidth}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2
              size={{ xs: 12, sm: sidebar ? 12 : 4 }}
              style={{ paddingTop: 10 }}
            >
              <BaseSelect
                label="Direction"
                controlClassName={classes.fullWidth}
                selector={() => useGetSceneSlideTypeQuery(props.sceneID)}
                action={setSceneSlideType(props.sceneID)}
              >
                {Object.values(STF).map((tf) => (
                  <MenuItem key={tf} value={tf}>
                    {en.get(tf)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 8 }}>
              <BaseSlider
                min={1}
                max={100}
                format={{ type: 'percent' }}
                label={{ text: 'Distance:', appendValue: true }}
                labelledBy="slide-distance-slider"
                selector={() => useGetSceneSlideDistanceQuery(props.sceneID)}
                action={setSceneSlideDistance(props.sceneID)}
              />
            </Grid2>
          </Grid2>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={() => useGetSceneHasBPMQuery(props.sceneID)}
            timing={{
              selector: () => useGetSceneSlideTFQuery(props.sceneID),
              action: setSceneSlideTF(props.sceneID)
            }}
            duration={{
              selector: () => useGetSceneSlideDurationQuery(props.sceneID),
              action: setSceneSlideDuration(props.sceneID)
            }}
            durationMin={{
              selector: () => useGetSceneSlideDurationMinQuery(props.sceneID),
              action: setSceneSlideDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: () => useGetSceneSlideDurationMaxQuery(props.sceneID),
              action: setSceneSlideDurationMax(props.sceneID)
            }}
            wave={{
              selector: () => useGetSceneSlideSinRateQuery(props.sceneID),
              action: setSceneSlideSinRate(props.sceneID),
              labelledBy: 'slide-sin-rate-slider'
            }}
            bpm={{
              selector: () => useGetSceneSlideBPMMultiQuery(props.sceneID),
              action: setSceneSlideBPMMulti(props.sceneID),
              labelledBy: 'slide-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid2>
      {easingControls && (
        <>
          <Grid2 size={12}>
            <Collapse in={slide} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid2>
          <Grid2 size={12}>
            <Collapse in={slide} className={classes.fullWidth}>
              <EasingCard
                sidebar={sidebar}
                easing={{
                  selector: () => useGetSceneSlideEaseQuery(props.sceneID),
                  action: setSceneSlideEase(props.sceneID)
                }}
                exponent={{
                  selector: () => useGetSceneSlideExpQuery(props.sceneID),
                  action: setSceneSlideExp(props.sceneID),
                  labelledBy: 'slide-exp-slider'
                }}
                overshoot={{
                  selector: () => useGetSceneSlideOvQuery(props.sceneID),
                  action: setSceneSlideOv(props.sceneID),
                  labelledBy: 'slide-ov-slider'
                }}
                amplitude={{
                  selector: () => useGetSceneSlideAmpQuery(props.sceneID),
                  action: setSceneSlideAmp(props.sceneID),
                  labelledBy: 'slide-amp-slider'
                }}
                period={{
                  selector: () => useGetSceneSlidePerQuery(props.sceneID),
                  action: setSceneSlidePer(props.sceneID),
                  labelledBy: 'slide-per-slider'
                }}
              />
            </Collapse>
          </Grid2>
        </>
      )}
    </Grid2>
  )
}

;(SlideCard as any).displayName = 'SlideCard'
export default SlideCard
