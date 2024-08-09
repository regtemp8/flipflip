import React from 'react'
import clsx from 'clsx'
import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'
import {
  Grid,
  Collapse,
  Typography,
  Tooltip,
  IconButton,
  Divider,
  type Theme
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SceneSelect from './SceneSelect'
import BaseSlider from '../common/slider/BaseSlider'
import {
  selectOverlayOpacity,
  selectOverlaySceneID,
  selectOverlayIsInvalid,
  selectOverlayRegenerate
} from '../../store/overlay/selectors'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectAppLastRouteIsPlayer } from '../../store/app/selectors'
import { setOverlayOpacity } from '../../store/overlay/slice'
import { changeOverlaySceneID } from '../../store/overlay/thunks'

const styles = (theme: Theme) =>
  createStyles({
    noPadding: {
      padding: '0 !important'
    },
    fullWidth: {
      width: '100%'
    },
    selectText: {
      color: theme.palette.text.secondary
    }
  })

export interface OverlayCardProps extends WithStyles<typeof styles> {
  overlayID: number
  enabled: boolean
  onRemove: () => void
}

function OverlayCard(props: OverlayCardProps) {
  const dispatch = useAppDispatch()
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const sceneID = useAppSelector(selectOverlaySceneID(props.overlayID))
  const regenerate = useAppSelector(selectOverlayRegenerate(props.overlayID))
  const invalid = useAppSelector(selectOverlayIsInvalid(props.overlayID))

  const classes = props.classes
  return (
    <React.Fragment key={props.overlayID}>
      <Grid item xs={12} className={clsx(!props.enabled && classes.noPadding)}>
        <Collapse in={props.enabled} className={classes.fullWidth}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={sidebar ? 12 : 5}>
              <Typography className={classes.selectText} variant="caption">
                Overlay{regenerate ? (invalid ? ' ✗' : ' ⟳') : ''}
              </Typography>
              <SceneSelect
                includeGrids
                value={sceneID}
                onChange={(sceneID: number) => {
                  dispatch(changeOverlaySceneID(props.overlayID, sceneID))
                }}
              />
            </Grid>
            <Grid item xs={12} sm={sidebar ? 12 : 7}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <BaseSlider
                    min={0}
                    max={100}
                    selector={selectOverlayOpacity(props.overlayID)}
                    action={setOverlayOpacity(props.overlayID)}
                    format={{ type: 'percent' }}
                    labelledBy="overlay-opacity-slider"
                    label={{ text: 'Overlay Opacity:', appendValue: true }}
                  />
                </Grid>
                <Grid item>
                  <Tooltip disableInteractive title="Remove Overlay">
                    <IconButton onClick={props.onRemove} size="large">
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Grid item xs={12} className={clsx(!props.enabled && classes.noPadding)}>
        <Collapse in={props.enabled} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
    </React.Fragment>
  )
}

;(OverlayCard as any).displayName = 'OverlayCard'
export default withStyles(styles)(OverlayCard as any)
