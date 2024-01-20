import React, { useState } from 'react'
import { cx } from '@emotion/css'
import { MultiValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { type Theme } from '@mui/material'
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
  const handleInputChange = (searchInput: string) => {
    setSearchInput(searchInput)
  }

  const handleChange = (
    search: MultiValue<{ label: string; value: string }>
  ) => {
    const filters: string[] = []
    if (search != null) {
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
    }

    dispatch(setScenePickerFilters(filters))
  }

  const { classes } = useStyles()
  return (
    <CreatableSelect
      className={cx(classes.searchSelect, 'CreatableSelect')}
      components={{ DropdownIndicator: null }}
      value={options}
      options={options}
      inputValue={searchInput}
      isClearable
      isMulti
      placeholder={props.placeholder}
      formatCreateLabel={(input: string) => 'Search for ' + input}
      onChange={handleChange}
      onInputChange={handleInputChange}
    />
  )
}

;(SceneSearch as any).displayName = 'SceneSearch'
export default SceneSearch
