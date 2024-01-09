import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  type Theme,
  Typography
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { green, red } from '@mui/material/colors'

import FontOptions from './FontOptions'
import BaseSwitch from '../common/BaseSwitch'
import {
  setCaptionScriptStopAtEnd,
  setCaptionScriptNextSceneAtEnd,
  setCaptionScriptSyncWithAudio,
  setCaptionScriptOpacity
} from '../../store/captionScript/actions'
import { setCaptionScript } from '../../store/captionScript/slice'
import {
  selectCaptionScript,
  selectCaptionScriptStopAtEnd,
  selectCaptionScriptNextSceneAtEnd,
  selectCaptionScriptSyncWithAudio,
  selectCaptionScriptOpacity
} from '../../store/captionScript/selectors'
import BaseSlider from '../common/slider/BaseSlider'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const styles = (theme: Theme) =>
  createStyles({
    bpmProgress: {
      position: 'absolute',
      right: 67
    },
    tagProgress: {
      position: 'absolute',
      right: 20
    },
    success: {
      backgroundColor: green[500],
      '&:hover': {
        backgroundColor: green[700]
      }
    },
    failure: {
      backgroundColor: red[500],
      '&:hover': {
        backgroundColor: red[700]
      }
    },
    actions: {
      marginRight: theme.spacing(3)
    },
    fullWidth: {
      width: '100%'
    },
    noPadding: {
      padding: '0 !important'
    },
    endInput: {
      paddingLeft: theme.spacing(1),
      paddingTop: 0
    },
    percentInput: {
      minWidth: theme.spacing(11)
    },
    toggleFont: {
      marginLeft: 'auto'
    },
    fontDivider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2)
    },
    fontProgress: {
      position: 'absolute'
    }
  })

export interface ScriptOptionsProps extends WithStyles<typeof styles> {
  scriptID: number
  onDone: () => void
}

function ScriptOptions(props: ScriptOptionsProps) {
  const dispatch = useAppDispatch()
  const originalScript = useAppSelector(
    selectCaptionScript(props.scriptID),
    () => true
  )
  const stopAtEnd = useAppSelector(selectCaptionScriptStopAtEnd(props.scriptID))
  const nextSceneAtEnd = useAppSelector(
    selectCaptionScriptNextSceneAtEnd(props.scriptID)
  )

  const onCancel = () => {
    dispatch(setCaptionScript(originalScript))
    props.onDone()
  }

  const classes = props.classes
  return (
    <Dialog open={true} onClose={onCancel} aria-describedby="edit-description">
      <DialogContent>
        <Typography variant="h6">Edit script options</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Collapse in={!nextSceneAtEnd}>
                  <BaseSwitch
                    label="Stop at End"
                    size="small"
                    selector={selectCaptionScriptStopAtEnd(props.scriptID)}
                    action={setCaptionScriptStopAtEnd(props.scriptID)}
                  />
                </Collapse>
                <Collapse in={!stopAtEnd}>
                  <BaseSwitch
                    label="Next Scene at End"
                    size="small"
                    selector={selectCaptionScriptNextSceneAtEnd(props.scriptID)}
                    action={setCaptionScriptNextSceneAtEnd(props.scriptID)}
                  />
                </Collapse>
                <BaseSwitch
                  label="Sync Timestamp with Audio"
                  size="small"
                  selector={selectCaptionScriptSyncWithAudio(props.scriptID)}
                  action={setCaptionScriptSyncWithAudio(props.scriptID)}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <BaseSlider
              min={0}
              max={100}
              selector={selectCaptionScriptOpacity(props.scriptID)}
              action={setCaptionScriptOpacity(props.scriptID)}
              labelledBy="opacity-slider"
              label={{ text: 'Script Opacity:', appendValue: true }}
              format={{ type: 'percent' }}
            />
          </Grid>
          <Grid item xs={12}>
            <FontOptions
              name={'Blink'}
              captionScriptId={props.scriptID}
              type="blink"
            />
            <Divider className={classes.fontDivider} />
            <FontOptions
              name={'Caption'}
              captionScriptId={props.scriptID}
              type="caption"
            />
            <Divider className={classes.fontDivider} />
            <FontOptions
              name={'Big Caption'}
              captionScriptId={props.scriptID}
              type="captionBig"
            />
            <Divider className={classes.fontDivider} />
            <FontOptions
              name={'Count'}
              captionScriptId={props.scriptID}
              type="count"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={props.onDone} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(ScriptOptions as any).displayName = 'ScriptOptions'
export default withStyles(styles)(ScriptOptions as any)
