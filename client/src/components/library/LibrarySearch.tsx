import React, { SyntheticEvent, useState } from 'react'
import { cx } from '@emotion/css'
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteInputChangeReason,
  FilterOptionsState,
  TextField,
  TextFieldVariants,
  type Theme
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { makeStyles } from 'tss-react/mui'
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

export interface LibrarySearchProps {
  displaySources: number[]
  filters: string[]
  placeholder: string
  isLibrary?: boolean
  isAudio?: boolean
  isScript?: boolean
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
  inputVariant?: TextFieldVariants
  onUpdateFilters: (filter: string[]) => void
}

function LibrarySearch(props: LibrarySearchProps) {
  const [searchInput, setSearchInput] = useState('')
  const options = useAppSelector(
    selectAppLibrarySearchOptions(
      props.displaySources,
      props.filters,
      searchInput,
      props.isLibrary,
      props.isAudio,
      props.isScript,
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
    event: SyntheticEvent<Element, Event>,
    value: (string | { value: string; label: string })[],
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<{ value: string; label: string }>
  ) => {
    if (value == null) {
      props.onUpdateFilters([])
    } else {
      let filters = Array<string>()
      const search = value.map((v) =>
        typeof v === 'string' ? { value: v, label: '' } : v
      )
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

  const handleInputChange = (
    event: SyntheticEvent<Element, Event>,
    searchInput: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setSearchInput(searchInput)
  }

  const handleFilterOptions = (
    options: { value: string; label: string }[],
    params: FilterOptionsState<{ value: string; label: string }>
  ) => {
    const { inputValue } = params
    const filtered = options
      .filter((option) => {
        const value =
          typeof option === 'string'
            ? option
            : (option as { label: string; value: string }).value
        return defaultValues.find((v) => v.value === value) == null
      })
      .filter((option) => {
        const label =
          typeof option === 'string'
            ? option
            : (option as { label: string; value: string }).label
        return label.includes(inputValue)
      })

    const missing =
      props.isCreatable &&
      options.find(
        (option) =>
          (typeof option === 'string' && inputValue === option) ||
          inputValue === (option as { label: string; value: string }).label
      ) == null
    if (inputValue !== '' && missing) {
      filtered.push({
        value: inputValue,
        label: `Search for "${inputValue}"`
      })
    }

    return filtered
  }

  const { classes } = useStyles()
  return (
    <Autocomplete
      multiple
      autoHighlight
      freeSolo={props.isCreatable}
      handleHomeEndKeys
      className={cx(
        classes.searchSelect,
        'CreatableSelect',
        !props.fullWidth && classes.limitWidth
      )}
      value={defaultValues}
      options={options}
      isOptionEqualToValue={(option, value) => {
        const optionValue = typeof option === 'string' ? option : option.value
        const valueValue = typeof value === 'string' ? value : value.value
        return optionValue === valueValue
      }}
      filterOptions={props.isCreatable ? handleFilterOptions : undefined}
      renderInput={(params) => (
        <TextField
          {...params}
          variant={props.inputVariant}
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
      onChange={handleChange}
      onInputChange={props.isCreatable ? handleInputChange : undefined}
      open={props.menuIsOpen}
      autoFocus={props.autoFocus}
      disableCloseOnSelect={props.showCheckboxes}
    />
  )
}

;(LibrarySearch as any).displayName = 'LibrarySearch'
export default LibrarySearch
