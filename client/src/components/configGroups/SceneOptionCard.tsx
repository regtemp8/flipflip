import { cx } from '@emotion/css'
import { Collapse, Divider, Grid2, MenuItem, type Theme } from '@mui/material'
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
} from '../../store/api/thunks'
import {
  useGetSceneBackForthQuery,
  useGetSceneBackForthBPMMultiQuery,
  useGetSceneBackForthDurationQuery,
  useGetSceneBackForthDurationMaxQuery,
  useGetSceneBackForthDurationMinQuery,
  useGetSceneBackForthSinRateQuery,
  useGetSceneBackForthTFQuery,
  useGetSceneBackgroundBlurQuery,
  useGetSceneBackgroundColorQuery,
  useGetSceneBackgroundColorSetQuery,
  useGetSceneBackgroundTypeQuery,
  useGetSceneImageTypeQuery,
  useGetSceneTimingBPMMultiQuery,
  useGetSceneTimingDurationQuery,
  useGetSceneTimingDurationMaxQuery,
  useGetSceneTimingDurationMinQuery,
  useGetSceneTimingSinRateQuery,
  useGetSceneTimingTFQuery
} from '../../store/api/selectors'
import {
  useGetSceneHasBPMQuery,
  useGetTutorialsQuery
} from '../../store/api/slice'
import { en, BT, IT, SDT } from 'flipflip-common'
import BaseSelect from '../common/BaseSelect'
import BaseSwitch from '../common/BaseSwitch'
import BaseSlider from '../common/slider/BaseSlider'
import TimingCard from '../common/TimingCard'
import ColorPicker from '../config/ColorPicker'
import ColorSetPicker from '../config/ColorSetPicker'
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
  sceneID: number
}

function SceneOptionCard(props: SceneOptionCardProps) {
  const sidebar = useIsPlayerRoute()
  const { data: tutorial } = useGetTutorialsQuery()
  const { data: backForth } = useGetSceneBackForthQuery(props.sceneID)
  const { data: backgroundType } = useGetSceneBackgroundTypeQuery(props.sceneID)

  const { classes } = useStyles()
  return (
    <Grid2 container spacing={2} alignItems="center">
      <Grid2
        size={12}
        className={cx(tutorial?.current === SDT.timing && classes.highlight)}
      >
        <TimingCard
          excludeScene={true}
          sidebar={sidebar}
          hasBPMSelector={() => useGetSceneHasBPMQuery(props.sceneID)}
          timing={{
            selector: () => useGetSceneTimingTFQuery(props.sceneID),
            action: setSceneTimingTF(props.sceneID)
          }}
          duration={{
            selector: () => useGetSceneTimingDurationQuery(props.sceneID),
            action: setSceneTimingDuration(props.sceneID)
          }}
          durationMin={{
            selector: () => useGetSceneTimingDurationMinQuery(props.sceneID),
            action: setSceneTimingDurationMin(props.sceneID)
          }}
          durationMax={{
            selector: () => useGetSceneTimingDurationMaxQuery(props.sceneID),
            action: setSceneTimingDurationMax(props.sceneID)
          }}
          wave={{
            selector: () => useGetSceneTimingSinRateQuery(props.sceneID),
            action: setSceneTimingSinRate(props.sceneID),
            labelledBy: 'scene-sin-rate-slider'
          }}
          bpm={{
            selector: () => useGetSceneTimingBPMMultiQuery(props.sceneID),
            action: setSceneTimingBPMMulti(props.sceneID),
            labelledBy: 'scene-bpm-multi-slider'
          }}
        />
      </Grid2>
      <Grid2 size={12}>
        <Divider />
      </Grid2>
      <Grid2
        size={12}
        className={cx(tutorial?.current === SDT.backForth && classes.highlight)}
      >
        <Grid2 container alignItems="center">
          <Grid2 size={12}>
            <BaseSwitch
              label="Back/Forth"
              tooltip="Go back and forth between the last two images"
              selector={() => useGetSceneBackForthQuery(props.sceneID)}
              action={setSceneBackForth(props.sceneID)}
            />
          </Grid2>
        </Grid2>
        <Collapse in={backForth}>
          <TimingCard
            label="Back/Forth Timing"
            excludeScene={true}
            sidebar={sidebar}
            hasBPMSelector={() => useGetSceneHasBPMQuery(props.sceneID)}
            timing={{
              selector: () => useGetSceneBackForthTFQuery(props.sceneID),
              action: setSceneBackForthTF(props.sceneID)
            }}
            duration={{
              selector: () => useGetSceneBackForthDurationQuery(props.sceneID),
              action: setSceneBackForthDuration(props.sceneID)
            }}
            durationMin={{
              selector: () =>
                useGetSceneBackForthDurationMinQuery(props.sceneID),
              action: setSceneBackForthDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: () =>
                useGetSceneBackForthDurationMaxQuery(props.sceneID),
              action: setSceneBackForthDurationMax(props.sceneID)
            }}
            wave={{
              selector: () => useGetSceneBackForthSinRateQuery(props.sceneID),
              action: setSceneBackForthSinRate(props.sceneID),
              labelledBy: 'bf-sin-rate-slider'
            }}
            bpm={{
              selector: () => useGetSceneBackForthBPMMultiQuery(props.sceneID),
              action: setSceneBackForthBPMMulti(props.sceneID),
              labelledBy: 'bf-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <Divider />
      </Grid2>
      <Grid2
        size={12}
        className={cx(
          tutorial?.current === SDT.imageSizing && classes.highlight
        )}
      >
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={{ xs: sidebar ? 8 : 12, sm: sidebar ? 8 : 6 }}>
            <BaseSelect
              label="Image Sizing"
              controlClassName={classes.fullWidth}
              selector={() => useGetSceneImageTypeQuery(props.sceneID)}
              action={setSceneImageType(props.sceneID)}
            >
              {Object.values(IT).map((it) => (
                <MenuItem key={it} value={it}>
                  {en.get(it)}
                </MenuItem>
              ))}
            </BaseSelect>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 6 }} />
          <Grid2 size={{ xs: sidebar ? 8 : 12, sm: sidebar ? 8 : 4 }}>
            <BaseSelect
              label="Background"
              controlClassName={classes.fullWidth}
              selector={() => useGetSceneBackgroundTypeQuery(props.sceneID)}
              action={setSceneBackgroundType(props.sceneID)}
            >
              {Object.values(BT).map((bt) => (
                <MenuItem key={bt} value={bt}>
                  {en.get(bt)}
                </MenuItem>
              ))}
            </BaseSelect>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 8 }}>
            <Collapse
              in={backgroundType === BT.blur}
              className={classes.fullWidth}
            >
              <BaseSlider
                min={0}
                max={30}
                selector={() => useGetSceneBackgroundBlurQuery(props.sceneID)}
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
                  type="background"
                  selector={() =>
                    useGetSceneBackgroundColorQuery(props.sceneID)
                  }
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
                  selector={() =>
                    useGetSceneBackgroundColorSetQuery(props.sceneID)
                  }
                  action={setSceneBackgroundColorSet(props.sceneID)}
                />
              )}
            </Collapse>
          </Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
  )
}

;(SceneOptionCard as any).displayName = 'SceneOptionCard'
export default SceneOptionCard
