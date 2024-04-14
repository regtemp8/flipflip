import React from 'react'

import {
  Collapse,
  Divider,
  Fab,
  Grid,
  IconButton,
  Theme,
  Tooltip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { PLT } from 'flipflip-common'
import BaseSwitch from '../common/BaseSwitch'
import { selectAppLastRouteIsPlayer } from '../../store/app/selectors'
import {
  setSceneTextEnabled,
  setSceneScriptPlaylist
} from '../../store/scene/actions'
import {
  setSceneAddScriptPlaylist,
  setSceneRemoveScriptPlaylist
} from '../../store/scene/slice'
import {
  selectSceneTextEnabled,
  selectSceneScriptPlaylists
} from '../../store/scene/selectors'
import { createSceneScriptPlaylist } from '../../store/scene/thunks'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import PlaylistSelect from '../common/PlaylistSelect'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => ({
  addButton: {
    boxShadow: 'none'
  }
}))

export interface TextCardProps {
  sceneID: number
}

function TextCard(props: TextCardProps) {
  const dispatch = useAppDispatch()
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const textEnabled = useAppSelector(selectSceneTextEnabled(props.sceneID))
  const scriptPlaylists = useAppSelector(
    selectSceneScriptPlaylists(props.sceneID)
  )

  const onAddPlaylist = () => {
    dispatch(
      setSceneAddScriptPlaylist({
        id: props.sceneID,
        value: 0
      })
    )
  }

  const onDeletePlaylist = (index: number) => {
    dispatch(
      setSceneRemoveScriptPlaylist({
        id: props.sceneID,
        value: index
      })
    )
  }

  const { classes } = useStyles()
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
    <>
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
      <Collapse in={textEnabled}>
        <Grid container spacing={1} sx={{ mt: 2 }}>
          {scriptPlaylists.map((playlist, i) => (
            <>
              <Grid item xs>
                <PlaylistSelect
                  type={PLT.script}
                  selector={() => playlist.toString()}
                  action={setSceneScriptPlaylist(props.sceneID, i)}
                  create={createSceneScriptPlaylist(props.sceneID, i)}
                  hideLabel
                />
              </Grid>
              <Grid item>
                <IconButton onClick={() => onDeletePlaylist(i)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Grid>
              {i !== scriptPlaylists.length - 1 && (
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

;(TextCard as any).displayName = 'TextCard'
export default TextCard
