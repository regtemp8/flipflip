import React, { type ChangeEvent } from 'react'
import { Radio, RadioGroup, FormControlLabel } from '@mui/material'
import type ReduxProps from './ReduxProps'
import { en } from 'flipflip-common'
import { useAppDispatch } from '../../store/hooks'

export interface BaseRadioGroupProps extends ReduxProps<string> {
  values: any
  disabled?: boolean
}

export default function BaseRadioGroup(props: BaseRadioGroupProps) {
  const dispatch = useAppDispatch()
  const { data: value } = props.selector()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(props.action(event.target.value))
  }

  return (
    <RadioGroup value={value ?? ''} onChange={onChange}>
      {Object.values(props.values).map((v: any) => (
        <FormControlLabel
          disabled={props.disabled}
          key={v}
          value={v}
          control={<Radio />}
          label={en.get(v)}
        />
      ))}
    </RadioGroup>
  )
}
