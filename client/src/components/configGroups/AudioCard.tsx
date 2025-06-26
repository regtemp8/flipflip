import {
  Collapse,
  Divider,
  Fab,
  Grid2,
  Tooltip,
  IconButton
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'

import BaseSwitch from '../common/BaseSwitch'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  useAddSceneAudioPlaylistMutation,
  useDeleteSceneAudioPlaylistMutation,
  useGetSceneAudioPlaylistsQuery
} from '../../store/api/slice'
import { useGetSceneAudioEnabledQuery } from '../../store/api/selectors'
import { setSceneAudioEnabled } from '../../store/api/thunks'

const useStyles = makeStyles()(() => ({
  addButton: {
    boxShadow: 'none'
  }
}))

export interface AudioCardProps {
  sceneID: number
  startPlaying: boolean
  persist?: boolean
  shorterSeek?: boolean
  showMsTimestamp?: boolean
  scenePaths?: any[]
  goBack?: () => void
  onPlaying?: (position: number, duration: number) => void
  setCurrentAudio?: (audioID: number) => void
}

function AudioCard(props: AudioCardProps) {
  const [addSceneAudioPlaylist] = useAddSceneAudioPlaylistMutation()
  const [deleteSceneAudioPlaylist] = useDeleteSceneAudioPlaylistMutation()
  const { data: audioEnabled } = useGetSceneAudioEnabledQuery(props.sceneID)
  const { data: audioPlaylists } = useGetSceneAudioPlaylistsQuery(props.sceneID)

  const onAddPlaylist = () => {
    addSceneAudioPlaylist({ id: props.sceneID })
  }

  const onDeletePlaylist = (_index: number) => {
    const { sceneID } = props
    const playlistID = -1
    deleteSceneAudioPlaylist({ sceneID, playlistID })
  }

  const { classes } = useStyles()
  return (
    <>
      <Grid2 container spacing={2} alignItems="center">
        <Grid2 size="grow">
          <Collapse in={!props.persist}>
            <BaseSwitch
              label="Audio Tracks"
              selector={() => useGetSceneAudioEnabledQuery(props.sceneID)}
              action={setSceneAudioEnabled(props.sceneID)}
            />
          </Collapse>
        </Grid2>
        <Grid2>
          <Collapse in={audioEnabled && !props.startPlaying}>
            <Tooltip disableInteractive title={'Add Playlist'}>
              <Fab
                className={classes.addButton}
                onClick={onAddPlaylist}
                size="small"
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </Collapse>
        </Grid2>
      </Grid2>
      <Collapse in={audioEnabled || props.persist}>
        <Grid2 container spacing={1} sx={{ mt: 2 }}>
          {audioPlaylists?.map((_playlist, i) => (
            <>
              <Grid2 size="grow">
                {/* <PlaylistSelect
                  type={PLT.audio}
                  selector={() => ({data: playlist})}
                  action={setSceneAudioPlaylist(props.sceneID, i)}
                  create={createSceneAudioPlaylist(props.sceneID, i)}
                  hideLabel
                /> */}
              </Grid2>
              <Grid2>
                <IconButton onClick={() => onDeletePlaylist(i)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Grid2>
              {i !== audioPlaylists.length - 1 && (
                <Grid2 size={12}>
                  <Divider />
                </Grid2>
              )}
            </>
          ))}
        </Grid2>
      </Collapse>
    </>
  )
}

;(AudioCard as any).displayName = 'AudioCard'
export default AudioCard
