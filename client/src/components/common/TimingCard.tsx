import { Grid, MenuItem, Tooltip, Collapse, type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import type ReduxProps from './ReduxProps'
import { en, TF } from 'flipflip-common'
import { useAppSelector } from '../../store/hooks'
import type CommonSliderProps from './slider/CommonSliderProps'
import BaseSelect from './BaseSelect'
import BaseSlider from './slider/BaseSlider'
import MillisTextField from './text/MillisTextField'
import { type RootState } from '../../store/store'

const useStyles = makeStyles()((theme: Theme) => ({
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0
  },
  fullWidth: {
    width: '100%'
  },
  noBPM: {
    marginLeft: theme.spacing(0.5)
  },
  select: {
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center'
    }
  }
}))

export interface BPMSliderProps extends CommonSliderProps {
  min?: number
  max?: number
  format?: 'times' | 'percent' | 'tick-bpm'
}

export interface TimingCardProps {
  label?: string
  excludeScene?: boolean
  sidebar: boolean
  hasBPMSelector: (state: RootState) => boolean
  timing: ReduxProps<string>
  duration: ReduxProps<number>
  wave: CommonSliderProps
  bpm: BPMSliderProps
  durationMin: ReduxProps<number>
  durationMax: ReduxProps<number>
}

function TimingCard(props: TimingCardProps) {
  const hasBPM = useAppSelector(props.hasBPMSelector)
  const timingFunction = useAppSelector(props.timing.selector)
  const { classes } = useStyles()
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={props.sidebar ? 12 : 4} style={{ paddingTop: 10 }}>
        <BaseSelect
          label={props.label ?? 'Timing'}
          controlClassName={classes.fullWidth}
          selectClassName={classes.select}
          selector={props.timing.selector}
          action={props.timing.action}
        >
          {Object.values(TF).map((tf) => {
            if (tf === TF.bpm) {
              return (
                <MenuItem key={tf} value={tf}>
                  {en.get(tf)}{' '}
                  {!hasBPM && (
                    <Tooltip
                      disableInteractive
                      title={'Missing audio with BPM'}
                    >
                      <ErrorOutlineIcon
                        color={'error'}
                        className={classes.noBPM}
                      />
                    </Tooltip>
                  )}
                </MenuItem>
              )
            } else if (props.excludeScene && tf === TF.scene) {
              return null
            } else {
              return (
                <MenuItem key={tf} value={tf}>
                  {en.get(tf)}
                </MenuItem>
              )
            }
          })}
        </BaseSelect>
      </Grid>
      <Grid item xs={12} sm={props.sidebar ? 12 : 8}>
        <Collapse in={timingFunction === TF.sin} className={classes.fullWidth}>
          <BaseSlider
            min={1}
            max={100}
            selector={props.wave.selector}
            action={props.wave.action}
            labelledBy={props.wave.labelledBy}
            label={{ text: 'Wave Rate' }}
            textField={{
              className: classes.endInput,
              min: 0,
              step: 5
            }}
          />
        </Collapse>
        <Collapse in={timingFunction === TF.bpm} className={classes.fullWidth}>
          <BaseSlider
            min={props.bpm.min ?? 1}
            max={props.bpm.max ?? 100}
            selector={props.bpm.selector}
            action={props.bpm.action}
            format={
              props.bpm.format
                ? { type: props.bpm.format }
                : { type: 'times', divideBy: 10 }
            }
            labelledBy={props.bpm.labelledBy}
            label={{ text: 'BPM Multiplier', appendValue: true }}
          />
        </Collapse>
        <Collapse
          in={timingFunction === TF.constant}
          className={classes.fullWidth}
        >
          <MillisTextField
            label="For"
            selector={props.duration.selector}
            action={props.duration.action}
          />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Collapse
          in={timingFunction === TF.random || timingFunction === TF.sin}
          className={classes.fullWidth}
        >
          <Grid container alignItems="center">
            <Grid item xs={12} sm={props.sidebar ? 12 : 6}>
              <MillisTextField
                label="Between"
                selector={props.durationMin.selector}
                action={props.durationMin.action}
              />
            </Grid>
            <Grid item xs={12} sm={props.sidebar ? 12 : 6}>
              <MillisTextField
                label="and"
                selector={props.durationMax.selector}
                action={props.durationMax.action}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  )
}

export default TimingCard
