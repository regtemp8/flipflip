import { Autocomplete, Checkbox, TextField } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import { useGetDisplaySelectOptionsQuery } from '../../store/api/slice'
import { SyntheticEvent } from 'react'
import { SelectOption } from 'flipflip-common'

const useStyles = makeStyles()(() => ({
  select: {
    color: grey[900]
  }
}))

interface MultiDisplaySelectProps {
  values?: number[]
  onChange: (displayIDs: number[]) => void
}

function MultiDisplaySelect(props: MultiDisplaySelectProps) {
  const { data } = useGetDisplaySelectOptionsQuery({
    onlyExtra: false,
    includeExtra: false
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
  return (
    <Autocomplete
      multiple
      className={classes.select}
      value={props.values ? props.values.map(toValue) : []}
      options={optionsList}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Multiple values"
          placeholder="Search ..."
        />
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
      filterSelectedOptions={false}
      disableCloseOnSelect
      onChange={onChange}
    />
  )
}

;(MultiDisplaySelect as any).displayName = 'MultiDisplaySelect'
export default MultiDisplaySelect
