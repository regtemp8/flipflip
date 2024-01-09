import React, { useState } from 'react'

import {
  Collapse,
  Divider,
  Fab,
  Grid,
  type Theme,
  Tooltip
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import AddIcon from '@mui/icons-material/Add'

import { RP } from 'flipflip-common'
import AudioPlaylist from '../player/AudioPlaylist'
import AudioOptions from '../library/AudioOptions'
import BaseSwitch from '../common/BaseSwitch'
import {
  selectSceneAudioEnabled,
  selectSceneAudioPlaylists
} from '../../store/scene/selectors'
import { setSceneAddAudioPlaylist } from '../../store/scene/slice'
import { setSceneAudioEnabled } from '../../store/scene/actions'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const styles = (theme: Theme) =>
  createStyles({
    addButton: {
      boxShadow: 'none'
    }
  })

export interface AudioCardProps extends WithStyles<typeof styles> {
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

  const [sourceOptions, setSourceOptions] = useState<number>()

  const onSourceOptionsDone = () => {
    setSourceOptions(undefined)
  }
  const onSourceOptions = (audioID: number) => {
    setSourceOptions(audioID)
  }

  const onAddPlaylist = () => {
    dispatch(
      setSceneAddAudioPlaylist({
        id: props.sceneID,
        value: { audios: [], shuffle: false, repeat: RP.all }
      })
    )
  }

  const classes = props.classes
  return (
    <Grid container alignItems="center">
      <Grid item xs={12}>
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
      </Grid>
      {audioPlaylists.map((playlist, i) => (
        <React.Fragment key={i}>
          <Grid item xs={12}>
            <Collapse in={audioEnabled || props.persist}>
              <AudioPlaylist
                playlistIndex={i}
                playlist={playlist}
                scenePaths={props.scenePaths}
                shorterSeek={props.shorterSeek}
                showMsTimestamp={props.showMsTimestamp}
                startPlaying={props.startPlaying}
                persist={props.persist}
                onSourceOptions={onSourceOptions}
                setCurrentAudio={
                  i === 0 && props.setCurrentAudio
                    ? props.setCurrentAudio
                    : undefined
                }
                goBack={props.goBack}
                onPlaying={props.onPlaying}
              />
            </Collapse>
          </Grid>
          {i !== audioPlaylists.length - 1 && (
            <Grid item xs={12}>
              <Collapse in={audioEnabled}>
                <Divider />
              </Collapse>
            </Grid>
          )}
        </React.Fragment>
      ))}
      {sourceOptions != null && (
        <AudioOptions
          sceneID={props.sceneID}
          audioID={sourceOptions}
          onDone={onSourceOptionsDone}
        />
      )}
    </Grid>
  )
}

;(AudioCard as any).displayName = 'AudioCard'
export default withStyles(styles)(AudioCard as any)
