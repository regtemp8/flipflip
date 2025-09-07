import { Autocomplete, Box, Checkbox, Chip, TextField } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import { useGetSceneSelectOptionsQuery } from '../../store/api/slice'
import { SyntheticEvent } from 'react'
import { SelectOption } from 'flipflip-common'

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
  const options = data ?? {}
  const optionsList = Object.keys(options).map((key) => {
    return { value: key, label: options[key] }
  })

  const onChange = (
    _event: SyntheticEvent<Element, Event>,
    options: unknown[]
  ) => {
    const values = options.map((option) => {
      const { value } = option as SelectOption
      return Number(value)
    })

    props.onChange(values)
  }

  const toValue = (id: number) => {
    const value = id.toString()
    return { value, label: options[value] }
  }

  const { classes } = useStyles()
  const id = 'multi-scene-select'
  return (
    <Autocomplete
      id={id}
      multiple
      className={classes.select}
      value={props.values ? props.values.map(toValue) : []}
      options={optionsList}
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
