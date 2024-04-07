import React, { type ChangeEvent, type ReactNode } from 'react'
import { TextField, type TextFieldVariants, Tooltip } from '@mui/material'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import type ReduxProps from '../ReduxProps'
import { AnyAction } from 'redux'

export interface BaseTextFieldProps<T, S> extends ReduxProps<T, S> {
  className?: string
  disabled?: boolean
  label?: string
  tooltip?: string
  placeholder?: string
  variant: TextFieldVariants
  margin?: 'dense' | 'normal' | 'none'
  autoFocus?: boolean
  fullWidth?: boolean
  multiline?: boolean
  id?: string
  onBlur?: () => void
  inputProps?: {
    className?: string
    min?: number
    max?: number
    step?: number
    type?: string
    labelledBy?: string
  }
  InputProps?: {
    endAdornment?: ReactNode
    className?: string
    readOnly?: boolean
  }
}

export default function BaseTextField<
  T extends string | number,
  S extends string | number | undefined
>(props: BaseTextFieldProps<T, S>) {
  const min = props?.inputProps?.min ?? 0
  const value = useAppSelector(props.selector)
  const dispatch = useAppDispatch()

  const onChangeText = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const action = props.action as (value: string) => AnyAction
    dispatch(action(event.target.value))
  }

  const onChangeNumber = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = event.target.value !== '' ? Number(event.target.value) : min
    value = Math.max(value, min)
    if (props?.inputProps?.max != null) {
      value = Math.min(value, props.inputProps.max)
    }

    const action = props.action as (value: number) => AnyAction
    dispatch(action(value))
  }

  const onChange =
    props?.inputProps?.type === 'number' ? onChangeNumber : onChangeText
  const onBlur = props.onBlur
    ? (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(event)
        props.onBlur!()
      }
    : onChange

  const renderTextField = () => {
    let inputProps: any
    if (props.inputProps != null) {
      const { className, min, max, step, type, labelledBy } = props.inputProps
      inputProps = { className, min, max, step, type }
      if (labelledBy != null) {
        inputProps['aria-labelledby'] = labelledBy
      }
    }

    return (
      <TextField
        className={props.className}
        disabled={props.disabled}
        multiline={props.multiline}
        variant={props.variant}
        label={props.label}
        placeholder={props.placeholder}
        margin={props.margin}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        InputProps={props.InputProps}
        inputProps={inputProps}
      />
    )
  }

  return props.tooltip != null ? (
    <Tooltip disableInteractive title={props.tooltip}>
      {renderTextField()}
    </Tooltip>
  ) : (
    renderTextField()
  )
}
