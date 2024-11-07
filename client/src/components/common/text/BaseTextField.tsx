import React, { type ChangeEvent, type ReactNode } from 'react'
import { TextField, type TextFieldVariants, Tooltip } from '@mui/material'
import { useAppDispatch } from '../../../store/hooks'
import type ReduxProps from '../ReduxProps'
import { AppDispatch } from '../../../store/store'

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
  scale?: number
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
  const { data: value } = props.selector()
  const dispatch = useAppDispatch()

  const getValue = (value?: S) => {
    if(props.inputProps?.type === 'number') {
      let num: number = value as number ?? min
      if(props.scale != null) {
        num *= props.scale
      }

      return Number(num).toFixed()
    } else {
      return value ?? ''
    }
  }

  const onChangeText = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const action = props.action as (
      value: string
    ) => (dispatch: AppDispatch) => void
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

    const action = props.action as (
      value: number
    ) => (dispatch: AppDispatch) => void
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
        fullWidth={props.fullWidth}
        multiline={props.multiline}
        variant={props.variant}
        label={props.label}
        placeholder={props.placeholder}
        margin={props.margin}
        value={getValue(value)}
        onChange={onChange}
        onBlur={onBlur}
        slotProps={{
          input: props.InputProps,
          htmlInput: inputProps
        }}
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
