import React, { type ReactNode } from 'react'
import {
  Slider as MaterialSlider,
  Grid,
  InputAdornment,
  Typography
} from '@mui/material'
import { type Mark } from '@mui/base/useSlider'
import { type Variant } from '@mui/material/styles/createTypography'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import type ReduxProps from '../ReduxProps'
import BaseTextField from '../text/BaseTextField'

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
  }
  label?: {
    text: string
    variant?: Variant
    color?: string
    appendValue?: boolean
  }
}

export default function BaseSlider(props: BaseSliderProps) {
  let value = useAppSelector(props.selector)
  if (props.scale) {
    value = value * props.scale
    value = Number(value.toFixed())
  }

  const dispatch = useAppDispatch()
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

  const onSliderChange = (event: Event, value: number | number[]) => {
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

  const renderSlider = (): JSX.Element => {
    const formatter = props.format ? getFormatter() : undefined
    return (
      <MaterialSlider
        min={props.min}
        max={props.max}
        step={props.marks ? null : props.step ?? 1}
        marks={props.marks}
        value={value}
        onChange={onSliderChange}
        valueLabelDisplay={'auto'}
        valueLabelFormat={formatter}
        aria-labelledby={props.labelledBy}
      />
    )
  }

  const renderSliderWithTextField = (): JSX.Element => {
    return (
      <Grid container spacing={1}>
        <Grid item xs>
          {renderSlider()}
        </Grid>
        <Grid item xs={3}>
          <BaseTextField
            variant="standard"
            selector={props.selector}
            action={props.action}
            InputProps={
              props?.format?.type === 'percent'
                ? {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    )
                  }
                : undefined
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
        </Grid>
      </Grid>
    )
  }

  const renderLabel = () => {
    return (
      <Typography
        variant={props.label?.variant ?? 'caption'}
        component="div"
        color={props.label?.color ?? 'textSecondary'}
      >
        {props.label?.text}{' '}
        {props.label?.appendValue
          ? props.format
            ? getFormatter()(value)
            : value
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
