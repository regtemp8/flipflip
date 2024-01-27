import {
  Grid,
  MenuItem,
  Tooltip,
  Collapse,
  type Theme,
  SelectChangeEvent
} from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import type ReduxProps from './ReduxProps'
import { TF } from '../../data/const'
import en from '../../data/en'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import type CommonSliderProps from './slider/CommonSliderProps'
import BaseSelect from './BaseSelect'
import BaseSlider from './slider/BaseSlider'
import MillisTextField from './text/MillisTextField'
import { type RootState } from '../../../store/store'

const styles = (theme: Theme) =>
  createStyles({
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
  })

export interface BPMSliderProps extends CommonSliderProps {
  min?: number
  max?: number
  format?: 'times' | 'percent' | 'tick-bpm'
}

export interface TimingCardProps extends WithStyles<typeof styles> {
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

function TimingCard (props: TimingCardProps) {
  const dispatch = useAppDispatch()
  const hasBPM = useAppSelector(props.hasBPMSelector)
  const timingFunction = useAppSelector(props.timing.selector)

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={props.sidebar ? 12 : 4} style={{ paddingTop: 10 }}>
        <BaseSelect
          label={props.label ?? 'Timing'}
          controlClassName={props.classes.fullWidth}
          selectClassName={props.classes.select}
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
                        className={props.classes.noBPM}
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
        <Collapse
          in={timingFunction === TF.sin}
          className={props.classes.fullWidth}
        >
          <BaseSlider
            min={1}
            max={100}
            selector={props.wave.selector}
            action={props.wave.action}
            labelledBy={props.wave.labelledBy}
            label={{ text: 'Wave Rate' }}
            textField={{
              className: props.classes.endInput,
              min: 0,
              step: 5
            }}
          />
        </Collapse>
        <Collapse
          in={timingFunction === TF.bpm}
          className={props.classes.fullWidth}
        >
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
          className={props.classes.fullWidth}
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
          className={props.classes.fullWidth}
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

export default withStyles(styles)(TimingCard as any)
