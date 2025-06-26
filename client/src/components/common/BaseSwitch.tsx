import { type ChangeEvent, type ReactNode } from 'react'
import { FormControlLabel, Switch, Tooltip } from '@mui/material'
import { useAppDispatch } from '../../store/hooks'

export interface BaseSwitchProps {
  label?: string
  disabled?: boolean
  size?: 'small' | 'medium'
  tooltip?: ReactNode
  selector: () => { data?: boolean }
  action?: (value: boolean) => any
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

export default function BaseSwitch(props: BaseSwitchProps) {
  const dispatch = useAppDispatch()
  const { data: value } = props.selector()

  let onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
  if (props.onChange != null) {
    onChange = props.onChange
  } else if (props.action != null) {
    onChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      dispatch(props.action!(checked))
    }
  } else {
    onChange = () => {
      console.warn('No change event handler assigned to switch')
    }
  }

  const renderSwitch = () => {
    return (
      <Switch
        checked={value === true}
        size={props.size}
        disabled={props.disabled}
        onChange={onChange}
      />
    )
  }

  const renderLabel = () => {
    return props.label != null ? (
      <FormControlLabel control={renderSwitch()} label={props.label} />
    ) : (
      renderSwitch()
    )
  }

  return props.tooltip != null ? (
    <Tooltip disableInteractive title={props.tooltip}>
      {renderLabel()}
    </Tooltip>
  ) : (
    renderLabel()
  )
}
