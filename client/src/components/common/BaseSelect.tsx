import React, { type PropsWithChildren } from 'react'
import {
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent
} from '@mui/material'
import type ReduxProps from './ReduxProps'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { AnyAction } from 'redux'
import { RootState } from '../../store/store'
import { ThunkAction } from '@reduxjs/toolkit'

export interface BaseSelectProps extends ReduxProps<string> {
  label: string
  controlClassName?: string
  selectClassName?: string
  disabled?: boolean
  style?: any
  MenuProps?: any
  valueMapper?: (value: string) => string
  create?: ThunkAction<void, RootState, undefined, AnyAction>
  hideLabel?: boolean
}

const CREATE_NEW_VALUE = '-2'
export default function BaseSelect(props: PropsWithChildren<BaseSelectProps>) {
  const dispatch = useAppDispatch()
  let value = useAppSelector(props.selector)
  if (props.valueMapper != null) {
    value = props.valueMapper(value)
  }

  const onChange = (event: SelectChangeEvent<string>) => {
    const { value } = event.target
    const action =
      value === CREATE_NEW_VALUE
        ? (props.create as ThunkAction<void, RootState, undefined, AnyAction>)
        : props.action(value)

    dispatch(action)
  }

  const hideLabel = props.hideLabel ?? false
  return (
    <>
      <FormControl variant="standard" className={props.controlClassName}>
        {!hideLabel && <InputLabel>{props.label}</InputLabel>}
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
          {props.create && <Divider />}
          {props.create && (
            <MenuItem key={CREATE_NEW_VALUE} value={CREATE_NEW_VALUE}>
              Create {props.label}
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </>
  )
}
