import { InputAdornment } from '@mui/material'

import type ReduxProps from '../ReduxProps'
import BaseTextField from './BaseTextField'

export interface MillisTextFieldProps extends ReduxProps<number> {
  label: string
}

export default function MillisTextField(props: MillisTextFieldProps) {
  return (
    <BaseTextField
      label={props.label}
      variant="outlined"
      margin="dense"
      selector={props.selector}
      action={props.action}
      InputProps={{
        endAdornment: <InputAdornment position="end">ms</InputAdornment>
      }}
      inputProps={{
        min: 0,
        step: 100,
        type: 'number'
      }}
    />
  )
}
