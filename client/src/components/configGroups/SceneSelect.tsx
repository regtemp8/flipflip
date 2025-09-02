import { Autocomplete, TextField, type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import { SyntheticEvent } from 'react'
import { useGetSceneSelectOptionsQuery } from '../../store/api/slice'

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

type SceneSelectOption = {
  value: string
  label: string
}

function SceneSelect(props: SceneSelectProps) {
  const { onlyExtra, includeExtra, includeRandom } = props
  const { data } = useGetSceneSelectOptionsQuery({
    onlyExtra,
    includeExtra,
    includeRandom
  })
  const options = data ?? {}

  const optionsList: SceneSelectOption[] = Object.keys(options).map((key) => {
    return { value: key, label: options[key] }
  })

  const onChange = (
    _event: SyntheticEvent<Element, Event>,
    option: unknown
  ) => {
    if (option != null) {
      const { value } = option as SceneSelectOption
      props.onChange(Number(value))
    }
  }

  const { classes } = useStyles()
  return (
    <Autocomplete
      className={classes.select}
      value={{
        value: props.value.toString(),
        label: options[props.value.toString()] ?? ''
      }}
      options={optionsList}
      renderInput={(params) => <TextField {...params} variant="standard" />}
      renderOption={(props, option) => {
        const { ...optionProps } = props
        const { value, label } = option as SceneSelectOption
        return (
          <li {...optionProps} key={value}>
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
