import { type ReactNode } from 'react'
import {
  Slider as MaterialSlider,
  Grid2,
  InputAdornment,
  Typography,
  InputProps
} from '@mui/material'
import { type Mark } from '@mui/material/Slider/useSlider.types'
import { type Variant } from '@mui/material/styles/createTypography'
import type ReduxProps from '../ReduxProps'
import BaseTextField from '../text/BaseTextField'
import { useAppDispatch } from '../../../store/hooks'

export interface BaseSliderProps extends ReduxProps<number> {
  min?: number
  max?: number
  step?: number
  marks?: boolean | Mark[]
  scale?: number
  labelledBy: string
  format?: {
    type?: 'times' | 'percent' | 'pixel' | 'second' | 'tick-bpm'
    divideBy?: number
  }
  textField?: {
    className: string
    step?: number
    min?: number
    InputProps?: InputProps
  }
  label?: {
    text: string
    variant?: Variant
    color?: string
    appendValue?: boolean
  }
}

export default function BaseSlider(props: BaseSliderProps) {
  const dispatch = useAppDispatch()
  const { data: value } = props.selector()

  const defaultFormatter = (v: number) =>
    props.format?.divideBy ? v / props.format.divideBy : v

  const formatters = new Map<string, (value: number) => ReactNode>([
    ['times', (v: number) => defaultFormatter(v) + 'x'],
    ['percent', (v: number) => defaultFormatter(v) + '%'],
    ['pixel', (v: number) => defaultFormatter(v) + 'px'],
    ['second', (v: number) => defaultFormatter(v) + ' sec'],
    [
      'tick-bpm',
      (v: number) => {
        const value = defaultFormatter(v)
        return value > 0 ? value + 'x' : '1/' + -1 * (value - 2) + 'x'
      }
    ]
  ])

  const getFormatter = () => {
    return (
      (props.format?.type && formatters.get(props.format.type)) ||
      defaultFormatter
    )
  }

  const onSliderChange = (_event: Event, value: number | number[]) => {
    const numberValue = Array.isArray(value) ? value[0] : value
    dispatchValueChange(numberValue)
  }

  const dispatchValueChange = (value?: number) => {
    if (value == null) return
    if (props.min != null && value < props.min) {
      value = props.min
    }
    if (props.max != null && value > props.max) {
      value = props.max
    }
    if (props.scale != null) {
      value = value / props.scale
    }

    dispatch(props.action(value))
  }

  const getValue = (value?: number): number => {
    return value ?? props.min ?? 0
  }

  const scaleValue = (value?: number): number => {
    value = getValue(value)
    if (props.scale == null) {
      return value
    }

    return Number((value * props.scale).toFixed())
  }

  const renderSlider = (): JSX.Element => {
    const formatter = props.format ? getFormatter() : undefined
    return (
      <MaterialSlider
        min={props.min}
        max={props.max}
        step={props.marks ? null : (props.step ?? 1)}
        marks={props.marks}
        value={scaleValue(value)}
        onChange={onSliderChange}
        valueLabelDisplay={'auto'}
        valueLabelFormat={formatter}
        aria-labelledby={props.labelledBy}
      />
    )
  }

  const renderSliderWithTextField = (): JSX.Element => {
    return (
      <Grid2 container spacing={1}>
        <Grid2 size="grow">{renderSlider()}</Grid2>
        <Grid2 size={3}>
          <BaseTextField
            variant="standard"
            selector={props.selector}
            action={props.action}
            scale={props.scale}
            InputProps={
              props?.format?.type === 'percent'
                ? {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    )
                  }
                : props.textField?.InputProps
            }
            inputProps={{
              className: props.textField?.className,
              step: props.textField?.step ?? props.step ?? 1,
              min: props.textField?.min ?? props.min,
              max: props.max,
              type: 'number',
              labelledBy: props.labelledBy
            }}
          />
        </Grid2>
      </Grid2>
    )
  }

  const renderLabel = () => {
    const v = scaleValue(value)
    return (
      <Typography
        variant={props.label?.variant ?? 'caption'}
        component="div"
        color={props.label?.color ?? 'textSecondary'}
      >
        {props.label?.text}{' '}
        {props.label?.appendValue
          ? props.format
            ? getFormatter()(v)
            : v
          : null}
      </Typography>
    )
  }

  return (
    <>
      {props.label ? renderLabel() : null}
      {props.textField ? renderSliderWithTextField() : renderSlider()}
    </>
  )
}
