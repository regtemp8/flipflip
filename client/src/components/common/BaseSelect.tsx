import { type PropsWithChildren } from 'react'
import {
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent
} from '@mui/material'
import type ReduxProps from './ReduxProps'
import { useAppDispatch } from '../../store/hooks'

export interface BaseSelectProps extends ReduxProps<string> {
  id: string
  label: string
  controlClassName?: string
  selectClassName?: string
  disabled?: boolean
  style?: any
  MenuProps?: any
  valueMapper?: (value: string) => string
  create?: () => Promise<void>
  hideLabel?: boolean
}

const CREATE_NEW_VALUE = '-2'
export default function BaseSelect(props: PropsWithChildren<BaseSelectProps>) {
  const dispatch = useAppDispatch()
  const { data } = props.selector()

  const getValue = (data?: string) => {
    let value = data ?? ''
    if (props.valueMapper != null) {
      value = props.valueMapper(value)
    }

    return value
  }

  const onChange = async (event: SelectChangeEvent<string>) => {
    const { value } = event.target
    if (value === CREATE_NEW_VALUE && props.create != null) {
      await props.create()
    } else if (value !== CREATE_NEW_VALUE) {
      dispatch(props.action(value))
    }
  }

  const hideLabel = props.hideLabel ?? false
  const labelId = `${props.id}-label`
  return (
    <>
      <FormControl variant="standard" className={props.controlClassName}>
        {!hideLabel && <InputLabel id={labelId}>{props.label}</InputLabel>}
        <Select
          id={props.id}
          labelId={labelId}
          variant="standard"
          value={getValue(data)}
          onChange={onChange}
          className={props.selectClassName}
          disabled={props.disabled ?? false}
          style={props.style}
          MenuProps={{
            ...props.MenuProps,
            id: `${props.id}-menu`
          }}
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
