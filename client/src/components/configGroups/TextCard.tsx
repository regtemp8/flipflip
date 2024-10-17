import React from 'react'

import {
  Collapse,
  Divider,
  Fab,
  Grid2,
  IconButton,
  Theme,
  Tooltip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { PLT } from 'flipflip-common'
import BaseSwitch from '../common/BaseSwitch'
import PlaylistSelect from '../common/PlaylistSelect'
import { makeStyles } from 'tss-react/mui'
import { useIsPlayerRoute } from '../useIsPlayerRoute'
import { useGetSceneTextEnabledQuery } from '../../store/api/selectors'
import {
  useAddSceneScriptPlaylistMutation,
  useDeleteSceneScriptPlaylistMutation,
  useGetSceneScriptPlaylistsQuery
} from '../../store/api/slice'
import { setSceneTextEnabled } from '../../store/api/thunks'

const useStyles = makeStyles()((theme: Theme) => ({
  addButton: {
    boxShadow: 'none'
  }
}))

export interface TextCardProps {
  sceneID: number
}

function TextCard(props: TextCardProps) {
  const sidebar = useIsPlayerRoute()
  const [addSceneScriptPlaylist] = useAddSceneScriptPlaylistMutation()
  const [deleteSceneScriptPlaylist] = useDeleteSceneScriptPlaylistMutation()
  const { data: textEnabled } = useGetSceneTextEnabledQuery(props.sceneID)
  const { data: scriptPlaylists } = useGetSceneScriptPlaylistsQuery(
    props.sceneID
  )

  const onAddPlaylist = () => {
    addSceneScriptPlaylist({ id: props.sceneID })
  }

  const onDeletePlaylist = (index: number) => {
    deleteSceneScriptPlaylist({ id: props.sceneID })
  }

  const { classes } = useStyles()
  if (sidebar) {
    return (
      <Grid2 container alignItems="center">
        <Grid2 size={12}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size="grow">
              <BaseSwitch
                label="Text Overlay"
                selector={() => useGetSceneTextEnabledQuery(props.sceneID)}
                action={setSceneTextEnabled(props.sceneID)}
              />
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
    )
  }

  return (
    <>
      <Grid2 container spacing={2} alignItems="center">
        <Grid2 size="grow">
          <BaseSwitch
            label="Text Overlay"
            selector={() => useGetSceneTextEnabledQuery(props.sceneID)}
            action={setSceneTextEnabled(props.sceneID)}
          />
        </Grid2>
        <Grid2>
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
        </Grid2>
      </Grid2>
      <Collapse in={textEnabled}>
        <Grid2 container spacing={1} sx={{ mt: 2 }}>
          {scriptPlaylists?.map((playlist, i) => (
            <>
              <Grid2 size="grow">
                {/* <PlaylistSelect
                  type={PLT.script}
                  selector={() => ({ data: playlist })}
                  action={setSceneScriptPlaylist(props.sceneID, i)}
                  create={createSceneScriptPlaylist(props.sceneID, i)}
                  hideLabel
                /> */}
              </Grid2>
              <Grid2>
                <IconButton onClick={() => onDeletePlaylist(i)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Grid2>
              {i !== scriptPlaylists.length - 1 && (
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

;(TextCard as any).displayName = 'TextCard'
export default TextCard
