import ReduxProps from './ReduxProps'
import BaseSelect from './BaseSelect'
import { Box, IconButton, MenuItem, Theme, Tooltip } from '@mui/material'
import { PLT } from 'flipflip-common'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import TvIcon from '@mui/icons-material/Tv'
import MovieIcon from '@mui/icons-material/Movie'
import DescriptionIcon from '@mui/icons-material/Description'
import { makeStyles } from 'tss-react/mui'
import { useNavigate } from 'react-router'
import {
  useCreatePlaylistMutation,
  useGetPlaylistOptionsQuery
} from '../../store/api/slice'
import { useAppDispatch } from '../../store/hooks'

const playlistTypeDisplayNames: Record<string, string> = {}
playlistTypeDisplayNames[PLT.audio] = 'Audio'
playlistTypeDisplayNames[PLT.display] = 'Display'
playlistTypeDisplayNames[PLT.scene] = 'Scene'
playlistTypeDisplayNames[PLT.script] = 'Script'

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
  includeSingles?: boolean
  hideLabel?: boolean
}

export default function PlaylistSelect(props: PlaylistSelectProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [createPlaylist] = useCreatePlaylistMutation()
  const { data: options } = useGetPlaylistOptionsQuery(props.type)
  const { data: value } = props.selector()

  const playlistID = value != null ? Number(value) : 0
  const onOpen = () => {
    navigate(`/playlists/${playlistID}`)
  }

  const onCreate = async () => {
    const { data } = await createPlaylist(props.type)
    if (data != null) {
      dispatch(props.action(data.value.toString()))
      navigate(`/playlists/${data.value}`)
    }
  }

  const { classes } = useStyles()
  const label = `${playlistTypeDisplayNames[props.type]} Playlist`
  return (
    <Box className={classes.flex}>
      <Tooltip disableInteractive title={`Open ${label}`}>
        <span className={classes.btnWrapper}>
          <IconButton
            onClick={onOpen}
            className={classes.btn}
            disabled={playlistID === 0}
          >
            {props.type === PLT.audio && <AudiotrackIcon />}
            {props.type === PLT.display && <TvIcon />}
            {props.type === PLT.scene && <MovieIcon />}
            {props.type === PLT.script && <DescriptionIcon />}
          </IconButton>
        </span>
      </Tooltip>
      <BaseSelect
        label={label}
        selector={props.selector}
        action={props.action}
        create={onCreate}
        controlClassName={classes.select}
        hideLabel={props.hideLabel}
      >
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </BaseSelect>
    </Box>
  )
}
