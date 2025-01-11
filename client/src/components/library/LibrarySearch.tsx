import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { cx } from '@emotion/css'
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Chip,
  FilterOptionsState,
  Stack,
  TextField,
  TextFieldVariants,
  type Theme,
  alpha
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { SelectOption } from 'flipflip-common'

const useStyles = makeStyles()((theme: Theme) => ({
  searchSelect: {
    minWidth: 200,
    maxHeight: theme.mixins.toolbar.minHeight
  },
  limitWidth: {
    maxWidth: `calc(100% - ${theme.spacing(7)})`
  }
}))

export interface LibrarySearchProps {
  filters: string[]
  options: SelectOption[]
  placeholder: string
  autoFocus?: boolean
  isCreatable?: boolean
  menuIsOpen?: boolean
  showCheckboxes?: boolean
  appBar?: boolean
  inputVariant?: TextFieldVariants
  onUpdateFilters: (filter: string[]) => void
}

function LibrarySearch(props: LibrarySearchProps) {
  const [open, setOpen] = useState(props.menuIsOpen ?? false)

  useEffect(() => {
    setOpen(props.menuIsOpen ?? false)
  }, [props.menuIsOpen])

  const defaultValues = useMemo(() => {
    return props.filters.map((filter) => ({ label: filter, value: filter }))
  }, [props.filters])
  const options = useMemo(() => {
    return [
      ...props.filters.map(
        (filter) =>
          props.options.find((o) => o.value === filter) as SelectOption
      ),
      ...props.options.filter((o) => !props.filters.includes(o.value))
    ]
  }, [props.filters, props.options])

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

  const handleFilterOptions = (
    options: Array<SelectOption>,
    params: FilterOptionsState<SelectOption>
  ) => {
    const { inputValue } = params
    // options can have undefined option when a filter is removed
    options = options.filter((option) => option != null)
    const filtered = options
      .filter((option) => {
        return defaultValues.find((v) => v.value === option.value) == null
      })
      .filter((option) => {
        return option.label.toLowerCase().includes(inputValue.toLowerCase())
      })

    const create =
      props.isCreatable &&
      inputValue !== '' &&
      options.find(
        (option) => inputValue.toLowerCase() === option.label.toLowerCase()
      ) == null
    if (create) {
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
      className={cx(classes.searchSelect, 'CreatableSelect')}
      value={defaultValues}
      options={options}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      filterOptions={props.isCreatable ? handleFilterOptions : undefined}
      renderInput={(params) => (
        <TextField
          {...params}
          variant={props.inputVariant}
          placeholder={
            defaultValues.length === 0 ? props.placeholder : undefined
          }
          sx={
            props.appBar
              ? (theme) => ({
                  '& .MuiOutlinedInput-root': {
                    flexWrap: 'nowrap',
                    input: {
                      color: theme.palette.primary.contrastText
                    },
                    fieldset: {
                      borderColor: alpha(
                        theme.palette.primary.contrastText,
                        0.23
                      )
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.contrastText
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    },
                    '.MuiAutocomplete-endAdornment > button': {
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        backgroundColor: alpha(
                          theme.palette.primary.contrastText,
                          0.08
                        )
                      }
                    }
                  }
                })
              : undefined
          }
        />
      )}
      renderTags={
        props.appBar
          ? (values, getTagProps, owner) => (
              <Stack
                direction="row"
                sx={(theme) => ({
                  overflowX: 'scroll',
                  maxWidth: `calc(100% - ${theme.spacing(7)})`
                })}
              >
                {values.map((value, index) => (
                  <Chip
                    label={owner.getOptionLabel(value)}
                    size={owner.size}
                    {...getTagProps({ index })}
                    {...owner.ChipProps}
                    sx={(theme) => ({
                      color: theme.palette.primary.contrastText,
                      backgroundColor: alpha(
                        theme.palette.primary.contrastText,
                        0.16
                      ),
                      '& .MuiChip-deleteIcon': {
                        color: alpha(theme.palette.primary.contrastText, 0.26)
                      }
                    })}
                  />
                ))}
              </Stack>
            )
          : undefined
      }
      onChange={handleChange}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      autoFocus={props.autoFocus}
      disableCloseOnSelect={props.showCheckboxes}
    />
  )
}

;(LibrarySearch as any).displayName = 'LibrarySearch'
export default LibrarySearch
