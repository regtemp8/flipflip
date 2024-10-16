import { PlaylistType, SceneGroupItem } from 'flipflip-common'
import { RootState } from '../../store/store'
import ReduxProps from './ReduxProps'
import { ThunkAction } from '@reduxjs/toolkit'
import { Action } from 'redux'
import BaseSelect from './BaseSelect'
import { Box, IconButton, MenuItem, Theme, Tooltip } from '@mui/material'
import { PLT } from 'flipflip-common'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import TvIcon from '@mui/icons-material/Tv'
import MovieIcon from '@mui/icons-material/Movie'
import DescriptionIcon from '@mui/icons-material/Description'
import { makeStyles } from 'tss-react/mui'
import { useNavigate } from 'react-router-dom'
import { useGetPlaylistOptionsQuery } from '../../store/api/slice'

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
  type: PlaylistType
  create: ThunkAction<void, RootState, undefined, Action<string>>
  includeSingles?: boolean
  hideLabel?: boolean
}

export default function PlaylistSelect(props: PlaylistSelectProps) {
  const navigate = useNavigate()
  const { data: options } = useGetPlaylistOptionsQuery(props.type)
  const { data: value } = props.selector()

  const playlistID = value != null ? Number(value) : 0
  const onOpen = () => {
    navigate(`/playlist/${playlistID}`)
  }

  const { classes } = useStyles()
  // TODO work in progress
  // const singles =
  //   props.includeSingles === true
  //     ? [
  //         { id: 9990, value: 'Wallpapers' },
  //         { id: 9991, value: 'Cars' }
  //       ]
  //     : undefined
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
        create={props.create}
        controlClassName={classes.select}
        hideLabel={props.hideLabel}
      >
        {options?.map((option: SceneGroupItem) => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
        {/* TODO work in progress */}
        {/* {singles && <Divider>Single Scene</Divider>}
        {singles?.map((option: SelectOption) => (
          <MenuItem key={option.id} value={option.id}>
            {option.value}
          </MenuItem>
        ))} */}
      </BaseSelect>
    </Box>
  )
}
