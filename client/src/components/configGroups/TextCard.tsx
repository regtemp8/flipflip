import React, { useState } from 'react'

import { Collapse, Divider, Fab, Grid, Tooltip } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import { RP } from 'flipflip-common'
import ScriptPlaylist from './ScriptPlaylist'
import ScriptOptions from '../library/ScriptOptions'
import BaseSwitch from '../common/BaseSwitch'
import { selectAppLastRouteIsPlayer } from '../../store/app/selectors'
import { setSceneTextEnabled } from '../../store/scene/actions'
import { setSceneAddScriptPlaylist } from '../../store/scene/slice'
import {
  selectSceneTextEnabled,
  selectSceneScriptPlaylistLength
} from '../../store/scene/selectors'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

export interface TextCardProps {
  sceneID: number
}

function TextCard(props: TextCardProps) {
  const dispatch = useAppDispatch()
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const textEnabled = useAppSelector(selectSceneTextEnabled(props.sceneID))
  const scriptPlaylistLength = useAppSelector(
    selectSceneScriptPlaylistLength(props.sceneID)
  )

  const [sourceOptions, setSourceOptions] = useState<number>()

  const onCloseSourceOptions = () => {
    setSourceOptions(undefined)
  }
  const onSourceOptions = (scriptID: number) => {
    setSourceOptions(scriptID)
  }

  const onAddPlaylist = () => {
    dispatch(
      setSceneAddScriptPlaylist({
        id: props.sceneID,
        value: { scripts: [], shuffle: false, repeat: RP.all }
      })
    )
  }

  if (sidebar) {
    return (
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <BaseSwitch
                label="Text Overlay"
                selector={selectSceneTextEnabled(props.sceneID)}
                action={setSceneTextEnabled(props.sceneID)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container alignItems="center">
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <BaseSwitch
              label="Text Overlay"
              selector={selectSceneTextEnabled(props.sceneID)}
              action={setSceneTextEnabled(props.sceneID)}
            />
          </Grid>
          <Grid item>
            <Collapse in={textEnabled}>
              <Tooltip disableInteractive title={'Add Playlist'}>
                <Fab onClick={onAddPlaylist} size="small">
                  <AddIcon />
                </Fab>
              </Tooltip>
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
      {[...Array(scriptPlaylistLength).keys()].map((index) => (
        <React.Fragment key={index}>
          <Grid item xs={12}>
            <Collapse in={textEnabled}>
              <ScriptPlaylist
                sceneID={props.sceneID}
                playlistIndex={index}
                onSourceOptions={onSourceOptions}
              />
            </Collapse>
          </Grid>
          {index !== scriptPlaylistLength - 1 && (
            <Grid item xs={12}>
              <Collapse in={textEnabled}>
                <Divider />
              </Collapse>
            </Grid>
          )}
        </React.Fragment>
      ))}
      {sourceOptions != null && (
        <ScriptOptions scriptID={sourceOptions} onDone={onCloseSourceOptions} />
      )}
    </Grid>
  )
}

;(TextCard as any).displayName = 'TextCard'
export default TextCard
