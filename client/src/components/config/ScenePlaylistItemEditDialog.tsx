import { ChangeEvent } from 'react'
import { cx } from '@emotion/css'
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid2,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Theme,
  Tooltip,
  Typography
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import { SCENE_NONE, SCENE_RANDOM } from 'flipflip-common'
import SceneSelect from '../configGroups/SceneSelect'
import { useGetScenesQuery } from '../../store/api/slice'
import MultiSceneSelect from '../configGroups/MultiSceneSelect'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectScenePlaylistItemEditDialog } from '../../store/playlist/selectors'
import {
  setScenePlaylistItemEditDialog,
  setScenePlaylistItemEditDialogDuration,
  setScenePlaylistItemEditDialogPlayAfterAllImages,
  setScenePlaylistItemEditDialogRandomScenes,
  setScenePlaylistItemEditDialogScene
} from '../../store/playlist/slice'
import { saveScenePlaylistItemEditDialog } from '../../store/playlist/thunks'

const useStyles = makeStyles()((theme: Theme) => ({
  randomSceneDialog: {
    minWidth: 400,
    overflow: 'visible'
  },
  noScroll: {
    overflow: 'visible'
  },
  selectTop: {
    zIndex: 3
  },
  multiSelectTop: {
    zIndex: 2
  },
  selectText: {
    color: theme.palette.text.secondary
  },
  noTopPadding: {
    paddingTop: '0 !important'
  }
}))

function ScenePlaylistItemEditDialog() {
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectScenePlaylistItemEditDialog())
  const { data: allScenes } = useGetScenesQuery()

  const onSceneChange = (sceneID: number) => {
    dispatch(setScenePlaylistItemEditDialogScene(sceneID))
  }

  const changeRandomScenes = (sceneIDs: number[]) => {
    dispatch(setScenePlaylistItemEditDialogRandomScenes(sceneIDs))
  }

  const onRandomSelectAll = () => {
    dispatch(setScenePlaylistItemEditDialogRandomScenes(allScenes ?? []))
  }

  const onChangeDuration = (event: ChangeEvent<HTMLInputElement>) => {
    const duration = Number(event.currentTarget.value)
    dispatch(setScenePlaylistItemEditDialogDuration(duration))
  }

  const onChangePlayAfterAllImages = (
    _event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    dispatch(setScenePlaylistItemEditDialogPlayAfterAllImages(checked))
  }

  const onSave = () => {
    dispatch(saveScenePlaylistItemEditDialog())
  }

  const onClose = () => {
    dispatch(setScenePlaylistItemEditDialog(undefined))
  }

  const { classes } = useStyles()
  return (
    <Dialog
      classes={{ paper: classes.randomSceneDialog }}
      open={data != null}
      onClose={onClose}
    >
      <DialogContent classes={{ root: classes.noScroll }}>
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={12} className={classes.selectTop}>
            <Typography className={classes.selectText} variant="caption">
              Scene
            </Typography>
            <SceneSelect
              id="scene-playlist-item-scene-select"
              value={data?.sceneID ?? SCENE_NONE}
              onChange={onSceneChange}
              includeExtra
            />
          </Grid2>
          <Grid2 size={12}>
            <Collapse in={data?.sceneID === SCENE_RANDOM}>
              <Grid2 container spacing={1} alignItems="center">
                <Grid2 size={12}>
                  <Typography className={classes.selectText} variant="caption">
                    Select which scenes to include
                  </Typography>
                </Grid2>
                <Grid2
                  size="grow"
                  className={cx(classes.noTopPadding, classes.multiSelectTop)}
                >
                  <MultiSceneSelect
                    values={data?.randomScenes}
                    onChange={changeRandomScenes}
                  />
                </Grid2>
                <Grid2 size="auto" className={classes.noTopPadding}>
                  <Tooltip disableInteractive title="Select All">
                    <IconButton onClick={onRandomSelectAll}>
                      <SelectAllIcon />
                    </IconButton>
                  </Tooltip>
                </Grid2>
              </Grid2>
            </Collapse>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 'grow' }}>
            <Collapse
              in={
                data?.sceneID !== SCENE_NONE &&
                data?.playAfterAllImages === false
              }
            >
              <TextField
                fullWidth
                label="Play for"
                variant="outlined"
                margin="dense"
                value={data?.duration}
                onChange={onChangeDuration}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">ms</InputAdornment>
                    )
                  },
                  htmlInput: {
                    min: 0,
                    step: 100,
                    type: 'number'
                  }
                }}
              />
            </Collapse>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 'auto' }}>
            <Collapse in={data?.sceneID !== SCENE_NONE}>
              <FormControlLabel
                control={
                  <Switch
                    checked={data?.playAfterAllImages === true}
                    onChange={onChangePlayAfterAllImages}
                  />
                }
                label="Play After All Images"
              />
            </Collapse>
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(ScenePlaylistItemEditDialog as any).displayName =
  'ScenePlaylistItemEditDialog'
export default ScenePlaylistItemEditDialog
