import React from 'react'

import {
  Collapse,
  Divider,
  Fab,
  Grid,
  type Theme,
  Tooltip,
  IconButton
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'

import { PLT } from 'flipflip-common'
import BaseSwitch from '../common/BaseSwitch'
import {
  selectSceneAudioEnabled,
  selectSceneAudioPlaylists
} from '../../store/scene/selectors'
import {
  setSceneAddAudioPlaylist,
  setSceneRemoveAudioPlaylist
} from '../../store/scene/slice'
import {
  setSceneAudioEnabled,
  setSceneAudioPlaylist
} from '../../store/scene/actions'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import PlaylistSelect from '../common/PlaylistSelect'
import { createSceneAudioPlaylist } from '../../store/scene/thunks'
import DeleteIcon from '@mui/icons-material/Delete'

const useStyles = makeStyles()((theme: Theme) => ({
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
  const dispatch = useAppDispatch()
  const audioEnabled = useAppSelector(selectSceneAudioEnabled(props.sceneID))
  const audioPlaylists = useAppSelector(
    selectSceneAudioPlaylists(props.sceneID)
  )

  const onAddPlaylist = () => {
    dispatch(
      setSceneAddAudioPlaylist({
        id: props.sceneID,
        value: 0
      })
    )
  }

  const onDeletePlaylist = (index: number) => {
    dispatch(
      setSceneRemoveAudioPlaylist({
        id: props.sceneID,
        value: index
      })
    )
  }

  const { classes } = useStyles()
  return (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Collapse in={!props.persist}>
            <BaseSwitch
              label="Audio Tracks"
              selector={selectSceneAudioEnabled(props.sceneID)}
              action={setSceneAudioEnabled(props.sceneID)}
            />
          </Collapse>
        </Grid>
        <Grid item>
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
        </Grid>
      </Grid>
      <Collapse in={audioEnabled || props.persist}>
        <Grid container spacing={1} sx={{ mt: 2 }}>
          {audioPlaylists.map((playlist, i) => (
            <>
              <Grid item xs>
                <PlaylistSelect
                  type={PLT.audio}
                  selector={() => playlist.toString()}
                  action={setSceneAudioPlaylist(props.sceneID, i)}
                  create={createSceneAudioPlaylist(props.sceneID, i)}
                  hideLabel
                />
              </Grid>
              <Grid item>
                <IconButton onClick={() => onDeletePlaylist(i)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Grid>
              {i !== audioPlaylists.length - 1 && (
                <Grid item xs={12}>
                  <Divider />
                </Grid>
              )}
            </>
          ))}
        </Grid>
      </Collapse>
    </>
  )
}

;(AudioCard as any).displayName = 'AudioCard'
export default AudioCard
