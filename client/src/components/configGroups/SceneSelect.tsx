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
import { useNavigate } from 'react-router'
import { SCENE_NONE, SceneSelectOption } from 'flipflip-common'
import SceneSelectErrorTooltip from './SceneSelectErrorTooltip'
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

const DEFAULT_VALUE = {
  value: SCENE_NONE.toString(),
  label: 'None',
  hasSources: true,
  hasValidWeights: true
}

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

const filter = createFilterOptions<SceneSelectOption>()
function SceneSelect(props: SceneSelectProps) {
  const { onlyExtra, includeExtra, includeRandom } = props
  const navigate = useNavigate()
  const [createScene] = useCreateSceneMutation()
  const { data } = useGetSceneSelectOptionsQuery({
    onlyExtra,
    includeExtra,
    includeRandom
  })
  const options = data ?? []

  const onCreate = async (name: string) => {
    const { data } = await createScene({ name })
    if (data != null) {
      props.onChange(data.value as number)
      navigate(`/scenes/${data.value}`)
    }
  }

  const onChange = async (
    _event: SyntheticEvent<Element, Event>,
    newValue: string | SceneSelectOption | null
  ) => {
    if (typeof newValue === 'string') {
      await onCreate(newValue)
    } else if (newValue?.label.match(/^Add ".*"$/)) {
      await onCreate(newValue.value)
    } else if (newValue != null) {
      props.onChange(Number(newValue.value))
    }
  }

  const { classes } = useStyles()
  const value = options.find(
    (option) => option.value === props.value.toString()
  )
  return (
    <Autocomplete
      id={props.id}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      fullWidth
      freeSolo
      className={classes.select}
      value={value ?? DEFAULT_VALUE}
      filterOptions={(options, params) => {
        const filtered = filter(options, params)

        const { inputValue } = params
        const isExisting = options.some((option) => inputValue === option.label)
        if (inputValue !== '' && !isExisting) {
          // Suggest the creation of a new value
          filtered.push({
            value: inputValue,
            label: `Add "${inputValue}"`,
            hasSources: true,
            hasValidWeights: true
          })
        }

        return filtered
      }}
      options={options}
      renderInput={(params) => {
        const option = options.find(
          (option) => option.label === params.inputProps.value
        )
        return (
          <TextField
            {...params}
            variant="standard"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  <SceneSelectErrorTooltip option={option} />
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )
      }}
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
            <SceneSelectErrorTooltip option={option} />
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
