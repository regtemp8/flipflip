import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  TextField,
  type Theme
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import { useAppSelector } from '../../store/hooks'
import { selectDisplaySelectOptions } from '../../store/display/selectors'
import { SyntheticEvent } from 'react'

const useStyles = makeStyles()((theme: Theme) => ({
  searchSelect: {
    minWidth: 200,
    maxWidth: `calc(100% - ${theme.spacing(7)})`,
    maxHeight: theme.mixins.toolbar.minHeight,
    color: grey[900]
  },
  select: {
    color: grey[900]
  }
}))

export interface DisplaySelectProps {
  value: number
  menuIsOpen?: boolean
  autoFocus?: boolean
  includeExtra?: boolean
  onlyExtra?: boolean
  onChange: (displayID: number) => void
}

function DisplaySelect(props: DisplaySelectProps) {
  const options = useAppSelector(
    selectDisplaySelectOptions(props.onlyExtra, props.includeExtra)
  )
  const optionsList = Object.keys(options).map((key) => {
    return { value: key, label: options[key] }
  })

  const onChange = (
    event: SyntheticEvent<Element, Event>,
    option: unknown,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown>
  ) => {
    if (option != null) {
      const { value } = option as { value: string; label: string }
      props.onChange(Number(value))
    }
  }

  const { classes } = useStyles()
  return (
    <Autocomplete
      className={classes.select}
      value={{
        label: options[props.value.toString()],
        value: props.value.toString()
      }}
      options={optionsList}
      renderInput={() => <TextField />} // TODO test how this looks
      open={props.menuIsOpen}
      autoFocus={props.autoFocus}
      onChange={onChange}
      disableClearable
    />
  )
}

;(DisplaySelect as any).displayName = 'DisplaySelect'
export default DisplaySelect
