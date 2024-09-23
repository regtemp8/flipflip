import React, { SyntheticEvent, useState } from 'react'

import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteInputChangeReason,
  TextField,
  type Theme
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { grey } from '@mui/material/colors'

import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectScenePickerFilters } from '../store/scenePicker/selectors'
import { setScenePickerFilters } from '../store/scenePicker/slice'

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

export interface SceneSearchProps {
  placeholder: string
}

function SceneSearch(props: SceneSearchProps) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectScenePickerFilters())
  const options = filters.map((filter) => {
    return { label: filter, value: filter }
  })

  const [searchInput, setSearchInput] = useState('')
  const handleInputChange = (
    event: SyntheticEvent<Element, Event>,
    searchInput: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setSearchInput(searchInput)
  }

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    value: (string | { value: string; label: string })[],
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<
      string | { value: string; label: string }
    >
  ) => {
    const filters: string[] = []
    const search = value.map((v) =>
      typeof v === 'string' ? { value: v, label: '' } : v
    )
    for (const s of search) {
      if (
        ((s.value.startsWith('"') || s.value.startsWith('-"')) &&
          s.value.endsWith('"')) ||
        ((s.value.startsWith("'") || s.value.startsWith("-'")) &&
          s.value.endsWith("'"))
      ) {
        filters.push(s.value)
      } else {
        filters.push(...s.value.split(' '))
      }
    }

    const uniqueFilters = filters.filter(
      (value, index, array) => array.indexOf(value) === index
    )
    dispatch(setScenePickerFilters(uniqueFilters))
  }

  const { classes } = useStyles()
  return (
    <Autocomplete
      className={classes.searchSelect}
      multiple
      value={options}
      options={options}
      inputValue={searchInput}
      onInputChange={handleInputChange}
      onChange={handleChange}
      selectOnFocus
      handleHomeEndKeys
      renderOption={(props, option, state) => {
        const { ...optionProps } = props
        return (
          <li key={state.index} {...optionProps}>
            {typeof option === 'string' ? option : option.label}
          </li>
        )
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params
        const missing =
          options.find(
            (option) =>
              (typeof option === 'string' && inputValue === option) ||
              inputValue === (option as { label: string; value: string }).label
          ) == null
        return inputValue !== '' && missing
          ? [
              {
                value: inputValue,
                label: `Search for "${inputValue}"`
              }
            ]
          : []
      }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={props.placeholder}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: 'white'
              }
            }
          }}
        />
      )}
    />
  )
}

;(SceneSearch as any).displayName = 'SceneSearch'
export default SceneSearch
