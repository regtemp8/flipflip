import React, { type PropsWithChildren } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent
} from '@mui/material'
import type ReduxProps from './ReduxProps'
import { useAppSelector, useAppDispatch } from '../../store/hooks'

export interface BaseSelectProps extends ReduxProps<string> {
  label: string
  controlClassName?: string
  selectClassName?: string
  disabled?: boolean
  style?: any
  MenuProps?: any
  valueMapper?: (value: string) => string
}

export default function BaseSelect(props: PropsWithChildren<BaseSelectProps>) {
  const dispatch = useAppDispatch()
  let value = useAppSelector(props.selector)
  if (props.valueMapper != null) {
    value = props.valueMapper(value)
  }

  const onChange = (event: SelectChangeEvent<string>) => {
    dispatch(props.action(event.target.value))
  }

  return (
    <FormControl variant="standard" className={props.controlClassName}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        variant="standard"
        value={value}
        onChange={onChange}
        className={props.selectClassName}
        disabled={props.disabled ?? false}
        style={props.style}
        MenuProps={props.MenuProps}
      >
        {props.children}
      </Select>
    </FormControl>
  )
}
