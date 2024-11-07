import * as React from 'react'
import { cx } from '@emotion/css'

import { Collapse, Divider, Grid2, MenuItem, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { en, SC, SL } from 'flipflip-common'
import ColorPicker from '../config/ColorPicker'
import ColorSetPicker from '../config/ColorSetPicker'
import BaseSelect from '../common/BaseSelect'
import TimingCard from '../common/TimingCard'
import EasingCard from '../common/EasingCard'
import {
  setSceneStrobe,
  setSceneStrobePulse,
  setSceneStrobeTF,
  setSceneStrobeDuration,
  setSceneStrobeDurationMin,
  setSceneStrobeDurationMax,
  setSceneStrobeSinRate,
  setSceneStrobeBPMMulti,
  setSceneStrobeDelayTF,
  setSceneStrobeDelayDuration,
  setSceneStrobeDelayDurationMin,
  setSceneStrobeDelayDurationMax,
  setSceneStrobeDelaySinRate,
  setSceneStrobeDelayBPMMulti,
  setSceneStrobeEase,
  setSceneStrobeExp,
  setSceneStrobeOv,
  setSceneStrobeAmp,
  setSceneStrobePer,
  setSceneStrobeColorType,
  setSceneStrobeLayer,
  setSceneStrobeOpacity,
  setSceneStrobeColor,
  setSceneStrobeColorSet
} from '../../store/api/thunks'
import {
  useGetSceneStrobeQuery,
  useGetSceneStrobePulseQuery,
  useGetSceneStrobeTFQuery,
  useGetSceneStrobeDurationQuery,
  useGetSceneStrobeDurationMinQuery,
  useGetSceneStrobeDurationMaxQuery,
  useGetSceneStrobeSinRateQuery,
  useGetSceneStrobeBPMMultiQuery,
  useGetSceneStrobeDelayTFQuery,
  useGetSceneStrobeDelayDurationQuery,
  useGetSceneStrobeDelayDurationMinQuery,
  useGetSceneStrobeDelayDurationMaxQuery,
  useGetSceneStrobeDelaySinRateQuery,
  useGetSceneStrobeDelayBPMMultiQuery,
  useGetSceneStrobeEaseQuery,
  useGetSceneStrobeExpQuery,
  useGetSceneStrobeOvQuery,
  useGetSceneStrobeAmpQuery,
  useGetSceneStrobePerQuery,
  useGetSceneStrobeColorTypeQuery,
  useGetSceneStrobeLayerQuery,
  useGetSceneStrobeOpacityQuery,
  useGetSceneStrobeColorQuery,
  useGetSceneStrobeColorSetQuery,
  useGetDisplaySettingsEasingControlsQuery
} from '../../store/api/selectors'
import { useGetSceneHasBPMQuery } from '../../store/api/slice'
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
  }
}))

export interface StrobeCardProps {
  sceneID: number
}

function StrobeCard(props: StrobeCardProps) {
  const { classes } = useStyles()
  const sidebar = useIsPlayerRoute()
  const { data: easingControls } = useGetDisplaySettingsEasingControlsQuery()

  const { data: strobe } = useGetSceneStrobeQuery(props.sceneID)
  const { data: strobePulse } = useGetSceneStrobePulseQuery(props.sceneID)
  const { data: strobeColorType } = useGetSceneStrobeColorTypeQuery(
    props.sceneID
  )
  const { data: strobeLayer } = useGetSceneStrobeLayerQuery(props.sceneID)

  return (
    <Grid2 container spacing={2} alignItems="center">
      <Grid2 size={12}>
        <Grid2 container alignItems="center">
          <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 5 }}>
            <BaseSwitch
              label="Strobe"
              selector={() => useGetSceneStrobeQuery(props.sceneID)}
              action={setSceneStrobe(props.sceneID)}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 7 }}>
            <Collapse
              in={strobe}
              className={cx(classes.fullWidth, classes.paddingLeft)}
            >
              <BaseSwitch
                label="Add Delay"
                size="small"
                selector={() => useGetSceneStrobePulseQuery(props.sceneID)}
                action={setSceneStrobePulse(props.sceneID)}
              />
            </Collapse>
          </Grid2>
        </Grid2>
      </Grid2>
      {strobe && strobeLayer !== SL.image && (<Grid2 size={12}>
        <Collapse
          in={strobe && strobeLayer !== SL.image}
          className={classes.fullWidth}
        >
          <Grid2 container spacing={2} alignItems="center">
            <Grid2
              size={{
                xs: 12,
                sm: !sidebar && strobeLayer === SL.bottom ? 4 : 12
              }}
            >
              <BaseSelect
                label="Color Type"
                controlClassName={classes.fullWidth}
                selector={() => useGetSceneStrobeColorTypeQuery(props.sceneID)}
                action={setSceneStrobeColorType(props.sceneID)}
              >
                {Object.values(SC).map((sc) => (
                  <MenuItem key={sc} value={sc}>
                    {en.get(sc)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Grid2>
          </Grid2>
        </Collapse>
      </Grid2>)}
      { strobe && strobeLayer !== SL.image && strobeColorType !== SC.colorRand && (<Grid2 size={12}>
        <Collapse
          in={
            strobe &&
            strobeLayer !== SL.image &&
            strobeColorType !== SC.colorRand
          }
          className={classes.fullWidth}
        >
          {strobe &&
            strobeLayer !== SL.image &&
            strobeColorType === SC.color && (
              <ColorPicker
                selector={() => useGetSceneStrobeColorQuery(props.sceneID)}
                action={setSceneStrobeColor(props.sceneID)}
              />
            )}
          {strobe &&
            strobeLayer !== SL.image &&
            strobeColorType === SC.colorSet && (
              <ColorSetPicker
                selector={() => useGetSceneStrobeColorSetQuery(props.sceneID)}
                action={setSceneStrobeColorSet(props.sceneID)}
              />
            )}
        </Collapse>
      </Grid2>)}
      {strobe && (<Grid2 size={12}>
        <Collapse in={strobe} className={classes.fullWidth}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2
              size={{
                xs: 12,
                sm: !sidebar && strobeLayer === SL.bottom ? 4 : 12
              }}
            >
              <BaseSelect
                label="Strobe Layer"
                controlClassName={classes.fullWidth}
                selector={() => useGetSceneStrobeLayerQuery(props.sceneID)}
                action={setSceneStrobeLayer(props.sceneID)}
              >
                {Object.values(SL).map((sl) => (
                  <MenuItem key={sl} value={sl}>
                    {en.get(sl)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Grid2>
            {strobeLayer === SL.bottom && (<Grid2
              size={{ xs: 12, sm: sidebar ? 12 : 'grow' }}
            >
              <Collapse
                in={strobeLayer === SL.bottom}
                className={classes.fullWidth}
              >
                <BaseSlider
                  min={0}
                  max={100}
                  scale={100}
                  selector={() => useGetSceneStrobeOpacityQuery(props.sceneID)}
                  action={setSceneStrobeOpacity(props.sceneID)}
                  labelledBy="strobe-opacity-slider"
                  label={{ text: 'Strobe Opacity' }}
                  format={{ type: 'percent' }}
                  textField={{ className: classes.endInput, step: 5 }}
                />
              </Collapse>
            </Grid2>)}
          </Grid2>
        </Collapse>
      </Grid2>)}
      {strobe && (<Grid2 size={12}>
        <Collapse in={strobe} className={classes.fullWidth}>
          <Divider sx={{mb: 2}}/>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={() => useGetSceneHasBPMQuery(props.sceneID)}
            timing={{
              selector: () => useGetSceneStrobeTFQuery(props.sceneID),
              action: setSceneStrobeTF(props.sceneID)
            }}
            duration={{
              selector: () => useGetSceneStrobeDurationQuery(props.sceneID),
              action: setSceneStrobeDuration(props.sceneID)
            }}
            durationMin={{
              selector: () => useGetSceneStrobeDurationMinQuery(props.sceneID),
              action: setSceneStrobeDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: () => useGetSceneStrobeDurationMaxQuery(props.sceneID),
              action: setSceneStrobeDurationMax(props.sceneID)
            }}
            wave={{
              selector: () => useGetSceneStrobeSinRateQuery(props.sceneID),
              action: setSceneStrobeSinRate(props.sceneID),
              labelledBy: 'strobe-sin-rate-slider'
            }}
            bpm={{
              selector: () => useGetSceneStrobeBPMMultiQuery(props.sceneID),
              action: setSceneStrobeBPMMulti(props.sceneID),
              labelledBy: 'strobe-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid2>)}
      {strobe && strobePulse && (<Grid2
        size={12}
      >
        <Collapse in={strobe && strobePulse} className={classes.fullWidth}>
          <Divider sx={{mb: 2}}/>
          <TimingCard
            label="Delay Timing"
            sidebar={sidebar}
            hasBPMSelector={() => useGetSceneHasBPMQuery(props.sceneID)}
            timing={{
              selector: () => useGetSceneStrobeDelayTFQuery(props.sceneID),
              action: setSceneStrobeDelayTF(props.sceneID)
            }}
            duration={{
              selector: () =>
                useGetSceneStrobeDelayDurationQuery(props.sceneID),
              action: setSceneStrobeDelayDuration(props.sceneID)
            }}
            durationMin={{
              selector: () =>
                useGetSceneStrobeDelayDurationMinQuery(props.sceneID),
              action: setSceneStrobeDelayDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: () =>
                useGetSceneStrobeDelayDurationMaxQuery(props.sceneID),
              action: setSceneStrobeDelayDurationMax(props.sceneID)
            }}
            wave={{
              selector: () => useGetSceneStrobeDelaySinRateQuery(props.sceneID),
              action: setSceneStrobeDelaySinRate(props.sceneID),
              labelledBy: 'strobe-delay-sin-rate-slider'
            }}
            bpm={{
              selector: () =>
                useGetSceneStrobeDelayBPMMultiQuery(props.sceneID),
              action: setSceneStrobeDelayBPMMulti(props.sceneID),
              labelledBy: 'strobe-delay-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid2>)}
      {easingControls && strobe && (
        <Grid2 size={12}>
          <Collapse in={strobe} className={classes.fullWidth}>
            <Divider sx={{mb: 2}}/>
            <EasingCard
              sidebar={sidebar}
              easing={{
                selector: () => useGetSceneStrobeEaseQuery(props.sceneID),
                action: setSceneStrobeEase(props.sceneID)
              }}
              exponent={{
                selector: () => useGetSceneStrobeExpQuery(props.sceneID),
                action: setSceneStrobeExp(props.sceneID),
                labelledBy: 'strobe-exp-slider'
              }}
              overshoot={{
                selector: () => useGetSceneStrobeOvQuery(props.sceneID),
                action: setSceneStrobeOv(props.sceneID),
                labelledBy: 'strobe-ov-slider'
              }}
              amplitude={{
                selector: () => useGetSceneStrobeAmpQuery(props.sceneID),
                action: setSceneStrobeAmp(props.sceneID),
                labelledBy: 'strobe-amp-slider'
              }}
              period={{
                selector: () => useGetSceneStrobePerQuery(props.sceneID),
                action: setSceneStrobePer(props.sceneID),
                labelledBy: 'strobe-per-slider'
              }}
            />
          </Collapse>
        </Grid2>
      )}
    </Grid2>
  )
}

;(StrobeCard as any).displayName = 'StrobeCard'
export default StrobeCard
