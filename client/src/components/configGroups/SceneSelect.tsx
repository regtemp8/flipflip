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
import { selectSceneSelectOptions } from '../../store/scene/selectors'
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

export interface SceneSelectProps {
  value: number
  menuIsOpen?: boolean
  autoFocus?: boolean
  includeRandom?: boolean
  includeExtra?: boolean
  onlyExtra?: boolean
  onChange: (sceneID: number) => void
}

function SceneSelect(props: SceneSelectProps) {
  const options = useAppSelector(
    selectSceneSelectOptions(
      props.onlyExtra,
      props.includeExtra,
      props.includeRandom
    )
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
      value={options[props.value.toString()]}
      options={optionsList}
      renderInput={(params) => <TextField {...params} variant="standard" />}
      renderOption={(props, option, { selected }) => {
        const { ...optionProps } = props
        const { value, label } = option as { value: string; label: string }
        return (
          <li key={value} {...optionProps}>
            {label}
          </li>
        )
      }}
      onChange={onChange}
    />
  )
}

;(SceneSelect as any).displayName = 'SceneSelect'
export default SceneSelect
