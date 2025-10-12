import {
  Autocomplete,
  createFilterOptions,
  TextField,
  type Theme
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import {
  useCreateSceneMutation,
  useGetSceneSelectOptionsQuery
} from '../../store/api/slice'
import { SelectOption } from 'flipflip-common'
import { useNavigate } from 'react-router'

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
  id: string
  value: number
  menuIsOpen?: boolean
  autoFocus?: boolean
  includeRandom?: boolean
  includeExtra?: boolean
  onlyExtra?: boolean
  onChange: (sceneID: number) => void
}

const filter = createFilterOptions<SelectOption>()
function SceneSelect(props: SceneSelectProps) {
  const { onlyExtra, includeExtra, includeRandom } = props
  const navigate = useNavigate()
  const [createScene] = useCreateSceneMutation()
  const { data } = useGetSceneSelectOptionsQuery({
    onlyExtra,
    includeExtra,
    includeRandom
  })
  const options = data ?? {}

  const optionsList: SelectOption[] = Object.keys(options).map((key) => {
    return { value: key, label: options[key] }
  })

  const onCreate = async (name: string) => {
    const { data } = await createScene({ name })
    if (data != null) {
      props.onChange(data.value as number)
      navigate(`/scenes/${data.value}`)
    }
  }

  const onChange = async (_event, newValue) => {
    if (typeof newValue === 'string') {
      await onCreate(newValue)
    } else if (newValue?.label.match(/^Add ".*"$/)) {
      await onCreate(newValue.value)
    } else if (newValue != null) {
      props.onChange(Number(newValue.value))
    }
  }

  const { classes } = useStyles()
  return (
    <Autocomplete
      id={props.id}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      fullWidth
      freeSolo
      className={classes.select}
      value={{
        value: props.value.toString(),
        label: options[props.value.toString()] ?? ''
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params)

        const { inputValue } = params
        const isExisting = options.some((option) => inputValue === option.label)
        if (inputValue !== '' && !isExisting) {
          // Suggest the creation of a new value
          filtered.push({
            value: inputValue,
            label: `Add "${inputValue}"`
          })
        }

        return filtered
      }}
      options={optionsList}
      renderInput={(params) => <TextField {...params} variant="standard" />}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.label
      }
      getOptionKey={(option) =>
        typeof option === 'string' ? option : option.value
      }
      renderOption={(props, option) => {
        const { key, ...optionProps } = props
        return (
          <li key={key} {...optionProps}>
            {option.label}
          </li>
        )
      }}
      slotProps={{
        popper: {
          id: `${props.id}-popper`
        }
      }}
      onChange={onChange}
    />
  )
}

;(SceneSelect as any).displayName = 'SceneSelect'
export default SceneSelect
