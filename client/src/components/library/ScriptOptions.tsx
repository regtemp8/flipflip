import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid2,
  type Theme,
  Typography
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { green, red } from '@mui/material/colors'

import FontOptions from './FontOptions'
import BaseSwitch from '../common/BaseSwitch'
import {
  setCaptionScriptStopAtEnd,
  setCaptionScriptNextSceneAtEnd,
  setCaptionScriptSyncWithAudio,
  setCaptionScriptOpacity
} from '../../store/api/thunks'
import {
  useGetCaptionScriptStopAtEndQuery,
  useGetCaptionScriptNextSceneAtEndQuery,
  useGetCaptionScriptSyncWithAudioQuery,
  useGetCaptionScriptOpacityQuery
} from '../../store/api/selectors'
import BaseSlider from '../common/slider/BaseSlider'
import { useGetCaptionScriptQuery } from '../../store/api/slice'

const useStyles = makeStyles()((theme: Theme) => ({
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
}))

export interface ScriptOptionsProps {
  scriptID: number
  onDone: () => void
}

function ScriptOptions(props: ScriptOptionsProps) {
  // TODO how to prevent update?
  const {data: originalScript} = useGetCaptionScriptQuery(props.scriptID)
  const {data: script} = useGetCaptionScriptQuery(props.scriptID)

  const onCancel = () => {
    // dispatch(setCaptionScript(originalScript))
    props.onDone()
  }

  const { classes } = useStyles()
  return (
    <Dialog open={true} onClose={onCancel} aria-describedby="edit-description">
      <DialogContent>
        <Typography variant="h6">Edit script options</Typography>
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={12}>
            <Grid2 container spacing={2} alignItems="center">
              <Grid2>
                <Collapse in={!script?.nextSceneAtEnd}>
                  <BaseSwitch
                    label="Stop at End"
                    size="small"
                    selector={() => useGetCaptionScriptStopAtEndQuery(props.scriptID)}
                    action={setCaptionScriptStopAtEnd(props.scriptID)}
                  />
                </Collapse>
                <Collapse in={!script?.stopAtEnd}>
                  <BaseSwitch
                    label="Next Scene at End"
                    size="small"
                    selector={() => useGetCaptionScriptNextSceneAtEndQuery(props.scriptID)}
                    action={setCaptionScriptNextSceneAtEnd(props.scriptID)}
                  />
                </Collapse>
                <BaseSwitch
                  label="Sync Timestamp with Audio"
                  size="small"
                  selector={() => useGetCaptionScriptSyncWithAudioQuery(props.scriptID)}
                  action={setCaptionScriptSyncWithAudio(props.scriptID)}
                />
              </Grid2>
            </Grid2>
          </Grid2>
          <Grid2 size={12}>
            <BaseSlider
              min={0}
              max={100}
              selector={() => useGetCaptionScriptOpacityQuery(props.scriptID)}
              action={setCaptionScriptOpacity(props.scriptID)}
              labelledBy="opacity-slider"
              label={{ text: 'Script Opacity:', appendValue: true }}
              format={{ type: 'percent' }}
            />
          </Grid2>
          <Grid2 size={12}>
            <FontOptions
              name={'Blink'}
              captionScriptID={props.scriptID}
              type="blink"
            />
            <Divider className={classes.fontDivider} />
            <FontOptions
              name={'Caption'}
              captionScriptID={props.scriptID}
              type="caption"
            />
            <Divider className={classes.fontDivider} />
            <FontOptions
              name={'Big Caption'}
              captionScriptID={props.scriptID}
              type="captionBig"
            />
            <Divider className={classes.fontDivider} />
            <FontOptions
              name={'Count'}
              captionScriptID={props.scriptID}
              type="count"
            />
          </Grid2>
        </Grid2>
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
export default ScriptOptions
