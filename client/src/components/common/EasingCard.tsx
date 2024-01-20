import { Grid, MenuItem, Collapse, type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { en, EA } from 'flipflip-common'
import BaseSlider from './slider/BaseSlider'
import type CommonSliderProps from './slider/CommonSliderProps'
import type ReduxProps from './ReduxProps'
import { useAppSelector } from '../../store/hooks'
import BaseSelect from './BaseSelect'

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%'
  }
}))

export interface EasingCardProps {
  label?: string
  sidebar: boolean
  easing: ReduxProps<string>
  exponent: CommonSliderProps
  overshoot: CommonSliderProps
  amplitude: CommonSliderProps
  period: CommonSliderProps
}

function EasingCard(props: EasingCardProps) {
  const {classes} = useStyles()
  const easing = useAppSelector(props.easing.selector)

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={props.sidebar ? 12 : 6}>
        <BaseSelect
          label={props.label ?? 'Easing'}
          controlClassName={classes.fullWidth}
          selector={props.easing.selector}
          action={props.easing.action}
        >
          {Object.values(EA).map((rf) => (
            <MenuItem key={rf} value={rf}>
              {en.get(rf)}
            </MenuItem>
          ))}
        </BaseSelect>
      </Grid>
      <Grid item xs={12} sm={props.sidebar ? 12 : 6}>
        <Collapse
          in={
            easing === EA.polyIn ||
            easing === EA.polyOut ||
            easing === EA.polyInOut
          }
          className={classes.fullWidth}
        >
          <BaseSlider
            min={1}
            max={10}
            selector={props.exponent.selector}
            action={props.exponent.action}
            format={{ divideBy: 2 }}
            labelledBy={props.exponent.labelledBy}
            label={{ text: 'Exponent:', appendValue: true }}
          />
        </Collapse>
        <Collapse
          in={
            easing === EA.backIn ||
            easing === EA.backOut ||
            easing === EA.backInOut
          }
          className={classes.fullWidth}
        >
          <BaseSlider
            min={1}
            max={10}
            selector={props.overshoot.selector}
            action={props.overshoot.action}
            format={{ divideBy: 2 }}
            labelledBy={props.overshoot.labelledBy}
            label={{ text: 'Overshoot:', appendValue: true }}
          />
        </Collapse>
      </Grid>
      <Grid item xs={12} sm={props.sidebar ? 12 : 6}>
        <Collapse
          in={
            easing === EA.elasticIn ||
            easing === EA.elasticOut ||
            easing === EA.elasticInOut
          }
          className={classes.fullWidth}
        >
          <BaseSlider
            min={1}
            max={40}
            selector={props.amplitude.selector}
            action={props.amplitude.action}
            format={{ divideBy: 20 }}
            labelledBy={props.amplitude.labelledBy}
            label={{ text: 'Amplitude:', appendValue: true }}
          />
        </Collapse>
      </Grid>
      <Grid item xs={12} sm={props.sidebar ? 12 : 6}>
        <Collapse
          in={
            easing === EA.elasticIn ||
            easing === EA.elasticOut ||
            easing === EA.elasticInOut
          }
          className={classes.fullWidth}
        >
          <BaseSlider
            min={1}
            max={20}
            selector={props.period.selector}
            action={props.period.action}
            format={{ divideBy: 20 }}
            labelledBy={props.period.labelledBy}
            label={{ text: 'Period:', appendValue: true }}
          />
        </Collapse>
      </Grid>
    </Grid>
  )
}

export default EasingCard
