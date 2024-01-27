import React, { type ChangeEvent, type ReactNode } from 'react'
import { FormControlLabel, Switch, Tooltip } from '@mui/material'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { type RootState } from '../../../store/store'

export interface BaseSwitchProps {
  label?: string
  disabled?: boolean
  size?: 'small' | 'medium'
  tooltip?: ReactNode
  selector: (state: RootState) => boolean
  action?: (value: boolean) => any
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

export default function BaseSwitch (props: BaseSwitchProps) {
  const dispatch = useAppDispatch()
  const value = useAppSelector(props.selector)

  let onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
  if (props.onChange) {
    onChange = props.onChange
  } else if (props.action) {
    onChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      dispatch(props.action!(checked))
    }
  } else {
    onChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      console.warn('No change event handler assigned to switch')
    }
  }

  const renderSwitch = () => {
    return (
      <Switch
        checked={value}
        size={props.size}
        disabled={props.disabled}
        onChange={onChange}
      />
    )
  }

  const renderLabel = () => {
    return props.label
      ? (
      <FormControlLabel control={renderSwitch()} label={props.label} />
        )
      : (
          renderSwitch()
        )
  }

  return props.tooltip
    ? (
    <Tooltip disableInteractive title={props.tooltip}>
      {renderLabel()}
    </Tooltip>
      )
    : (
        renderLabel()
      )
}
