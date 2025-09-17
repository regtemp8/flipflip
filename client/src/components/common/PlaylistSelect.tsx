import ReduxProps from './ReduxProps'
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  createFilterOptions,
  IconButton,
  TextField,
  Theme,
  Tooltip
} from '@mui/material'
import { PLT, SelectOption } from 'flipflip-common'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import MovieIcon from '@mui/icons-material/Movie'
import DescriptionIcon from '@mui/icons-material/Description'
import { makeStyles } from 'tss-react/mui'
import { useNavigate } from 'react-router'
import {
  useCreatePlaylistMutation,
  useGetPlaylistOptionsQuery,
  useGetPlaylistQuery,
  useGetSelectedPlaylistQuery
} from '../../store/api/slice'
import { useAppDispatch } from '../../store/hooks'

const playlistTypeDisplayNames: Record<string, string> = {}
playlistTypeDisplayNames[PLT.audio] = 'Audio Playlist'
playlistTypeDisplayNames[PLT.scene] = 'Scene Playlist'
playlistTypeDisplayNames[PLT.singleScene] = 'Scene'
playlistTypeDisplayNames[PLT.script] = 'Script Playlist'

const playlistTypePages: Record<string, string> = {}
playlistTypePages[PLT.audio] = 'playlists'
playlistTypePages[PLT.scene] = 'playlists'
playlistTypePages[PLT.script] = 'playlists'
playlistTypePages[PLT.singleScene] = 'scenes'

const useStyles = makeStyles()((theme: Theme) => ({
  flex: {
    display: 'flex'
  },
  select: {
    flexGrow: 1
  },
  btn: {
    marginRight: theme.spacing(1)
  },
  btnWrapper: {
    alignSelf: 'flex-end'
  }
}))

export interface PlaylistSelectProps extends ReduxProps<string> {
  type: string
  singleType?: string
  hideLabel?: boolean
}

const filter = createFilterOptions<SelectOption>()

export default function PlaylistSelect(props: PlaylistSelectProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [createPlaylist] = useCreatePlaylistMutation()
  const { data: options } = useGetPlaylistOptionsQuery({
    type: props.type,
    includeNone: props.singleType == null
  })
  const { data: singleOptions } = useGetPlaylistOptionsQuery(
    { type: props.singleType ?? '', includeNone: true },
    { skip: props.singleType == null }
  )
  const { data: value } = props.selector()

  const playlistID = value != null ? Number(value) : 0
  const { data: selectedPlaylist } = useGetSelectedPlaylistQuery(playlistID, {
    skip: playlistID === 0
  })

  const onOpen = () => {
    if (selectedPlaylist == null) {
      return
    }

    navigate(
      `/${playlistTypePages[selectedPlaylist.type]}/${selectedPlaylist.itemId ?? selectedPlaylist.id}`
    )
  }

  const onCreate = async (name: string) => {
    const { data } = await createPlaylist({ type: props.type, name })
    if (data != null) {
      dispatch(props.action(data.value.toString()))
      navigate(`/${playlistTypePages[props.type]}/${data.value}`)
    }
  }

  const autoCompleteOptions = [...(singleOptions ?? []), ...(options ?? [])]
  const optionValue = autoCompleteOptions.find(
    (option) => option.value === value
  )
  const { classes } = useStyles()
  return (
    <Box className={classes.flex}>
      <Tooltip
        disableInteractive
        title={`Open ${playlistTypeDisplayNames[selectedPlaylist?.type ?? props.type]}`}
      >
        <span className={classes.btnWrapper}>
          <IconButton
            onClick={onOpen}
            className={classes.btn}
            disabled={selectedPlaylist == null}
          >
            {props.type === PLT.audio && <AudiotrackIcon />}
            {(props.type === PLT.scene || props.type === PLT.singleScene) && (
              <MovieIcon />
            )}
            {props.type === PLT.script && <DescriptionIcon />}
          </IconButton>
        </span>
      </Tooltip>

      {optionValue && (
        <Autocomplete
          value={optionValue}
          onChange={async (event, newValue) => {
            if (typeof newValue === 'string') {
              await onCreate(newValue)
            } else if (newValue != null) {
              dispatch(props.action(newValue.value))
            }
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params)

            const { inputValue } = params
            const isExisting = options.some(
              (option) => inputValue === option.label
            )
            if (inputValue !== '' && !isExisting) {
              // Suggest the creation of a new value
              filtered.push({
                value: inputValue,
                label: `Add "${inputValue}"`
              })
            }

            return filtered
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          fullWidth
          freeSolo
          id={`${playlistTypeDisplayNames[props.type].toLowerCase().split(' ').join('-')}`}
          options={autoCompleteOptions}
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
              </li>
            )
          }}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField
              {...params}
              label={playlistTypeDisplayNames[props.type]}
            />
          )}
        />
      )}
    </Box>
  )
}
