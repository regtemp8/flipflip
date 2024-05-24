import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Checkbox,
  Chip,
  TextField,
  type Theme
} from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import { useAppSelector } from '../../store/hooks'
import { selectMultiSceneSelectOptions } from '../../store/scene/selectors'
import { SyntheticEvent } from 'react'

const useStyles = makeStyles()((theme: Theme) => ({
  select: {
    color: grey[900]
  }
}))

interface MultiSceneSelectProps {
  values?: number[]
  onChange: (sceneIDs: number[]) => void
}

function MultiSceneSelect(props: MultiSceneSelectProps) {
  const options = useAppSelector(selectMultiSceneSelectOptions())
  const optionsList = Object.keys(options).map((key) => {
    return { value: key, label: options[key] }
  })

  const onChange = (
    event: SyntheticEvent<Element, Event>,
    options: unknown[],
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown>
  ) => {
    const values = options.map((option) => {
      const { value } = option as { value: string; label: string }
      return Number(value)
    })

    props.onChange(values)
  }

  const toValue = (id: number) => {
    const value = id.toString()
    return { value, label: options[value] }
  }

  const { classes } = useStyles()
  return (
    <Autocomplete
      multiple
      className={classes.select}
      value={props.values ? props.values.map(toValue) : []}
      options={optionsList}
      renderInput={(params) => <TextField {...params} variant="standard" />}
      renderTags={(value, getTagProps) => (
        <Box sx={{ maxHeight: 200, overflowY: 'scroll' }}>
          {value.map((option, index) => {
            const { label } = option as { value: number; label: string }
            return (
              <Chip {...getTagProps({ index })} key={index} label={label} />
            )
          })}
        </Box>
      )}
      renderOption={(props, option, { selected }) => {
        const { ...optionProps } = props
        const { value, label } = option as { value: number; label: string }
        return (
          <li key={value} {...optionProps}>
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
      disableCloseOnSelect
      onChange={onChange}
    />
  )
}

;(MultiSceneSelect as any).displayName = 'MultiSceneSelect'
export default MultiSceneSelect
