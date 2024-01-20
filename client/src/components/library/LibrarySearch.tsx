import React, { useState } from 'react'
import { cx } from '@emotion/css'
import Select, { MultiValue, components } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { Checkbox, type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import type Audio from '../../store/audio/Audio'
import type LibrarySource from '../../store/librarySource/LibrarySource'
import { useAppSelector } from '../../store/hooks'
import { selectAppLibrarySearchOptions } from '../../store/app/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
  searchSelect: {
    minWidth: 200,
    maxHeight: theme.mixins.toolbar.minHeight,
    color: grey[900]
  },
  limitWidth: {
    maxWidth: `calc(100% - ${theme.spacing(7)})`
  },
  select: {
    color: grey[900]
  }
}))

function Option(props: any) {
  return (
    <div>
      <components.Option {...props}>
        {props.showCheckboxes && (
          <Checkbox
            className={props.classes.select}
            checked={props.isSelected}
            onChange={() => null}
          />
        )}
        <label>{props.label}</label>
      </components.Option>
    </div>
  )
}

function MultiValueComponent(props: any) {
  return (
    <components.MultiValue {...props}>
      <span>{props.data.label}</span>
    </components.MultiValue>
  )
}

export interface LibrarySearchProps {
  filters: string[]
  placeholder: string
  displaySources: Array<LibrarySource | Audio>
  onUpdateFilters: (filter: string[]) => void
  autoFocus?: boolean
  controlShouldRenderValue?: boolean
  hideSelectedOptions?: boolean
  isClearable?: boolean
  isCreatable?: boolean
  menuIsOpen?: boolean
  noTypes?: boolean
  onlyTags?: boolean
  onlyTagsAndTypes?: boolean
  onlyUsed?: boolean
  showCheckboxes?: boolean
  fullWidth?: boolean
  withBrackets?: boolean
}

function LibrarySearch(props: LibrarySearchProps) {
  const [searchInput, setSearchInput] = useState('')
  const options = useAppSelector(
    selectAppLibrarySearchOptions(
      props.filters,
      searchInput,
      props.onlyUsed,
      props.onlyTags,
      props.onlyTagsAndTypes,
      props.isCreatable,
      props.withBrackets,
      props.noTypes
    )
  )

  const defaultValues = props.filters.map((filter) => {
    return { label: filter, value: filter }
  })

  const handleChange = (
    search: MultiValue<{ label: string; value: string }>
  ) => {
    if (search == null) {
      props.onUpdateFilters([])
    } else {
      let filters = Array<string>()
      for (const s of search) {
        if (
          !props.isCreatable ||
          ((s.value.startsWith('[') || s.value.startsWith('-[')) &&
            s.value.endsWith(']')) ||
          ((s.value.startsWith('{') || s.value.startsWith('-{')) &&
            s.value.endsWith('}')) ||
          s.value.startsWith('playlist:') ||
          s.value.startsWith('artist:') ||
          s.value.startsWith('album:') ||
          ((s.value.startsWith('"') || s.value.startsWith('-"')) &&
            s.value.endsWith('"')) ||
          ((s.value.startsWith("'") || s.value.startsWith("-'")) &&
            s.value.endsWith("'"))
        ) {
          filters = filters.concat(s.value)
        } else {
          filters = filters.concat(s.value.split(' '))
        }
      }
      props.onUpdateFilters(filters)
    }
  }

  const handleInputChange = (searchInput: string) => {
    setSearchInput(searchInput)
  }

  const { classes } = useStyles()
  if (props.isCreatable) {
    return (
      <CreatableSelect
        className={cx(
          classes.searchSelect,
          'CreatableSelect',
          !props.fullWidth && classes.limitWidth
        )}
        value={defaultValues}
        options={options}
        components={{ DropdownIndicator: null }}
        menuIsOpen={props.menuIsOpen}
        autoFocus={props.autoFocus}
        inputValue={searchInput}
        isClearable
        isMulti
        controlShouldRenderValue={props.controlShouldRenderValue}
        placeholder={props.placeholder}
        formatCreateLabel={(input: string) => 'Search for ' + input}
        onChange={handleChange}
        onInputChange={handleInputChange}
      />
    )
  } else {
    return (
      <Select
        className={classes.select}
        value={defaultValues}
        options={options}
        components={{ Option, MultiValue: MultiValueComponent }}
        menuIsOpen={props.menuIsOpen}
        autoFocus={props.autoFocus}
        isClearable={props.isClearable}
        isMulti
        controlShouldRenderValue={props.controlShouldRenderValue}
        hideSelectedOptions={props.hideSelectedOptions}
        closeMenuOnSelect={false}
        backspaceRemovesValue={false}
        placeholder={props.placeholder}
        onChange={handleChange}
      />
    )
  }
}

;(LibrarySearch as any).displayName = 'LibrarySearch'
export default LibrarySearch
