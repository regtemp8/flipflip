import * as React from 'react'
import clsx from 'clsx'

import { Collapse, Divider, Grid, MenuItem, type Theme } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { en, SC, SL } from 'flipflip-common'
import ColorPicker from '../config/ColorPicker'
import ColorSetPicker from '../config/ColorSetPicker'
import BaseSelect from '../common/BaseSelect'
import TimingCard from '../common/TimingCard'
import EasingCard from '../common/EasingCard'
import { useAppSelector } from '../../store/hooks'
import {
  selectAppConfigDisplaySettingsEasingControls,
  selectAppLastRouteIsPlayer
} from '../../store/app/selectors'
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
} from '../../store/scene/actions'
import {
  selectSceneHasBPM,
  selectSceneStrobe,
  selectSceneStrobePulse,
  selectSceneStrobeTF,
  selectSceneStrobeDuration,
  selectSceneStrobeDurationMin,
  selectSceneStrobeDurationMax,
  selectSceneStrobeSinRate,
  selectSceneStrobeBPMMulti,
  selectSceneStrobeDelayTF,
  selectSceneStrobeDelayDuration,
  selectSceneStrobeDelayDurationMin,
  selectSceneStrobeDelayDurationMax,
  selectSceneStrobeDelaySinRate,
  selectSceneStrobeDelayBPMMulti,
  selectSceneStrobeEase,
  selectSceneStrobeExp,
  selectSceneStrobeOv,
  selectSceneStrobeAmp,
  selectSceneStrobePer,
  selectSceneStrobeColorType,
  selectSceneStrobeLayer,
  selectSceneStrobeOpacity,
  selectSceneStrobeColor,
  selectSceneStrobeColorSet
} from '../../store/scene/selectors'
import BaseSwitch from '../common/BaseSwitch'
import BaseSlider from '../common/slider/BaseSlider'

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
    endInput: {
      paddingLeft: theme.spacing(1),
      paddingTop: 0
    },
    percentInput: {
      minWidth: theme.spacing(11)
    }
  })

export interface StrobeCardProps extends WithStyles<typeof styles> {
  sceneID?: number
}

function StrobeCard(props: StrobeCardProps) {
  const classes = props.classes
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const strobe = useAppSelector(selectSceneStrobe(props.sceneID))
  const strobePulse = useAppSelector(selectSceneStrobePulse(props.sceneID))
  const strobeColorType = useAppSelector(
    selectSceneStrobeColorType(props.sceneID)
  )
  const strobeLayer = useAppSelector(selectSceneStrobeLayer(props.sceneID))
  const easingControls = useAppSelector(
    selectAppConfigDisplaySettingsEasingControls()
  )

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
        <Grid container alignItems="center">
          <Grid item xs={12} sm={sidebar ? 12 : 5}>
            <BaseSwitch
              label="Strobe"
              selector={selectSceneStrobe(props.sceneID)}
              action={setSceneStrobe(props.sceneID)}
            />
          </Grid>
          <Grid item xs={12} sm={sidebar ? 12 : 7}>
            <Collapse
              in={strobe}
              className={clsx(classes.fullWidth, classes.paddingLeft)}
            >
              <BaseSwitch
                label="Add Delay"
                size="small"
                selector={selectSceneStrobePulse(props.sceneID)}
                action={setSceneStrobePulse(props.sceneID)}
              />
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        className={clsx(
          (!strobe || strobeLayer === SL.image) && classes.noPadding
        )}
      >
        <Collapse
          in={strobe && strobeLayer !== SL.image}
          className={classes.fullWidth}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid
              item
              xs={12}
              sm={!sidebar && strobeLayer === SL.bottom ? 4 : 12}
            >
              <BaseSelect
                label="Color Type"
                controlClassName={classes.fullWidth}
                selector={selectSceneStrobeColorType(props.sceneID)}
                action={setSceneStrobeColorType(props.sceneID)}
              >
                {Object.values(SC).map((sc) => (
                  <MenuItem key={sc} value={sc}>
                    {en.get(sc)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Grid
        item
        xs={12}
        className={clsx(
          (!strobe || strobeLayer === SL.image) && classes.noPadding
        )}
      >
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
                selector={selectSceneStrobeColor(props.sceneID)}
                action={setSceneStrobeColor(props.sceneID)}
              />
            )}
          {strobe &&
            strobeLayer !== SL.image &&
            strobeColorType === SC.colorSet && (
              <ColorSetPicker
                selector={selectSceneStrobeColorSet(props.sceneID)}
                action={setSceneStrobeColorSet(props.sceneID)}
              />
            )}
        </Collapse>
      </Grid>
      <Grid item xs={12} className={clsx(!strobe && classes.noPadding)}>
        <Collapse in={strobe} className={classes.fullWidth}>
          <Grid container spacing={2} alignItems="center">
            <Grid
              item
              xs={12}
              sm={!sidebar && strobeLayer === SL.bottom ? 4 : 12}
            >
              <BaseSelect
                label="Strobe Layer"
                controlClassName={classes.fullWidth}
                selector={selectSceneStrobeLayer(props.sceneID)}
                action={setSceneStrobeLayer(props.sceneID)}
              >
                {Object.values(SL).map((sl) => (
                  <MenuItem key={sl} value={sl}>
                    {en.get(sl)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Grid>
            <Grid
              item
              xs={12}
              sm={sidebar ? 12 : true}
              className={clsx(strobeLayer !== SL.bottom && classes.noPadding)}
            >
              <Collapse
                in={strobeLayer === SL.bottom}
                className={classes.fullWidth}
              >
                <BaseSlider
                  min={0}
                  max={100}
                  scale={100}
                  selector={selectSceneStrobeOpacity(props.sceneID)}
                  action={setSceneStrobeOpacity(props.sceneID)}
                  labelledBy="strobe-opacity-slider"
                  label={{ text: 'Strobe Opacity' }}
                  format={{ type: 'percent' }}
                  textField={{ className: classes.endInput, step: 5 }}
                />
              </Collapse>
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Grid item xs={12} className={clsx(!strobe && classes.noPadding)}>
        <Collapse in={strobe} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12} className={clsx(!strobe && classes.noPadding)}>
        <Collapse in={strobe} className={classes.fullWidth}>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={selectSceneHasBPM(props.sceneID)}
            timing={{
              selector: selectSceneStrobeTF(props.sceneID),
              action: setSceneStrobeTF(props.sceneID)
            }}
            duration={{
              selector: selectSceneStrobeDuration(props.sceneID),
              action: setSceneStrobeDuration(props.sceneID)
            }}
            durationMin={{
              selector: selectSceneStrobeDurationMin(props.sceneID),
              action: setSceneStrobeDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: selectSceneStrobeDurationMax(props.sceneID),
              action: setSceneStrobeDurationMax(props.sceneID)
            }}
            wave={{
              selector: selectSceneStrobeSinRate(props.sceneID),
              action: setSceneStrobeSinRate(props.sceneID),
              labelledBy: 'strobe-sin-rate-slider'
            }}
            bpm={{
              selector: selectSceneStrobeBPMMulti(props.sceneID),
              action: setSceneStrobeBPMMulti(props.sceneID),
              labelledBy: 'strobe-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid>
      <Grid
        item
        xs={12}
        className={clsx((!strobe || !strobePulse) && classes.noPadding)}
      >
        <Collapse in={strobe && strobePulse} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid
        item
        xs={12}
        className={clsx((!strobe || !strobePulse) && classes.noPadding)}
      >
        <Collapse in={strobe && strobePulse} className={classes.fullWidth}>
          <TimingCard
            label="Delay Timing"
            sidebar={sidebar}
            hasBPMSelector={selectSceneHasBPM(props.sceneID)}
            timing={{
              selector: selectSceneStrobeDelayTF(props.sceneID),
              action: setSceneStrobeDelayTF(props.sceneID)
            }}
            duration={{
              selector: selectSceneStrobeDelayDuration(props.sceneID),
              action: setSceneStrobeDelayDuration(props.sceneID)
            }}
            durationMin={{
              selector: selectSceneStrobeDelayDurationMin(props.sceneID),
              action: setSceneStrobeDelayDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: selectSceneStrobeDelayDurationMax(props.sceneID),
              action: setSceneStrobeDelayDurationMax(props.sceneID)
            }}
            wave={{
              selector: selectSceneStrobeDelaySinRate(props.sceneID),
              action: setSceneStrobeDelaySinRate(props.sceneID),
              labelledBy: 'strobe-delay-sin-rate-slider'
            }}
            bpm={{
              selector: selectSceneStrobeDelayBPMMulti(props.sceneID),
              action: setSceneStrobeDelayBPMMulti(props.sceneID),
              labelledBy: 'strobe-delay-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid>
      {easingControls && (
        <React.Fragment>
          <Grid item xs={12} className={clsx(!strobe && classes.noPadding)}>
            <Collapse in={strobe} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid>
          <Grid item xs={12} className={clsx(!strobe && classes.noPadding)}>
            <Collapse in={strobe} className={classes.fullWidth}>
              <EasingCard
                sidebar={sidebar}
                easing={{
                  selector: selectSceneStrobeEase(props.sceneID),
                  action: setSceneStrobeEase(props.sceneID)
                }}
                exponent={{
                  selector: selectSceneStrobeExp(props.sceneID),
                  action: setSceneStrobeExp(props.sceneID),
                  labelledBy: 'strobe-exp-slider'
                }}
                overshoot={{
                  selector: selectSceneStrobeOv(props.sceneID),
                  action: setSceneStrobeOv(props.sceneID),
                  labelledBy: 'strobe-ov-slider'
                }}
                amplitude={{
                  selector: selectSceneStrobeAmp(props.sceneID),
                  action: setSceneStrobeAmp(props.sceneID),
                  labelledBy: 'strobe-amp-slider'
                }}
                period={{
                  selector: selectSceneStrobePer(props.sceneID),
                  action: setSceneStrobePer(props.sceneID),
                  labelledBy: 'strobe-per-slider'
                }}
              />
            </Collapse>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  )
}

;(StrobeCard as any).displayName = 'StrobeCard'
export default withStyles(styles)(StrobeCard as any)
