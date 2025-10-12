import { Autocomplete, Box, Checkbox, Chip, TextField } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import { useGetSceneSelectOptionsQuery } from '../../store/api/slice'
import { SyntheticEvent } from 'react'
import { SceneSelectOption, SelectOption } from 'flipflip-common'
import SceneSelectErrorTooltip from './SceneSelectErrorTooltip'

const useStyles = makeStyles()(() => ({
  select: {
    color: grey[900]
  }
}))

interface MultiSceneSelectProps {
  values?: number[]
  onChange: (sceneIDs: number[]) => void
}

function MultiSceneSelect(props: MultiSceneSelectProps) {
  const { data } = useGetSceneSelectOptionsQuery({
    onlyExtra: false,
    includeExtra: false,
    includeRandom: false
  })
  const options = data ?? []

  const onChange = (
    _event: SyntheticEvent<Element, Event>,
    options: unknown[]
  ) => {
    const values = options.map((option) => {
      const { value } = option as SceneSelectOption
      return Number(value)
    })

    props.onChange(values)
  }

  const { classes } = useStyles()
  const id = 'multi-scene-select'
  const value = options.filter((option) =>
    props.values?.includes(Number(option.value))
  )
  return (
    <Autocomplete
      id={id}
      multiple
      className={classes.select}
      value={value}
      options={options}
      renderInput={(params) => <TextField {...params} variant="standard" />}
      renderTags={(value, getTagProps) => (
        <Box sx={{ maxHeight: 200, overflowY: 'scroll' }}>
          {value.map((option, index) => {
            const { label } = option as SelectOption
            return (
              <Chip {...getTagProps({ index })} key={index} label={label} />
            )
          })}
        </Box>
      )}
      renderOption={(props, option, { selected }) => {
        const { ...optionProps } = props
        const { value, label } = option as SelectOption
        return (
          <li {...optionProps} key={value}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {label}
            <SceneSelectErrorTooltip option={option} />
          </li>
        )
      }}
      slotProps={{
        popper: {
          id: `${id}-popper`
        }
      }}
      disableCloseOnSelect
      onChange={onChange}
    />
  )
}

;(MultiSceneSelect as any).displayName = 'MultiSceneSelect'
export default MultiSceneSelect
