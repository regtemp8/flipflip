import * as React from 'react'
import clsx from 'clsx'

import { Collapse, Divider, Grid, type Theme } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'
import BaseSlider from '../common/slider/BaseSlider'
import { en, HTF, SDT, VTF } from 'flipflip-common'
import TimingCard from '../common/TimingCard'
import MoveCard from '../common/MoveCard'
import EasingCard from '../common/EasingCard'
import {
  selectAppTutorial,
  selectAppConfigDisplaySettingsEasingControls,
  selectAppLastRouteIsPlayer
} from '../../store/app/selectors'
import {
  setSceneZoomTF,
  setSceneZoomDuration,
  setSceneZoomDurationMin,
  setSceneZoomDurationMax,
  setSceneZoomSinRate,
  setSceneZoomBPMMulti,
  setSceneTransEase,
  setSceneTransExp,
  setSceneTransOv,
  setSceneTransAmp,
  setSceneTransPer,
  setSceneHorizTransType,
  setSceneHorizTransRandom,
  setSceneHorizTransLevel,
  setSceneHorizTransLevelMin,
  setSceneHorizTransLevelMax,
  setSceneVertTransType,
  setSceneVertTransRandom,
  setSceneVertTransLevel,
  setSceneVertTransLevelMin,
  setSceneVertTransLevelMax,
  setSceneZoom,
  setSceneZoomRandom,
  setSceneZoomStart,
  setSceneZoomEnd,
  setSceneZoomStartMin,
  setSceneZoomStartMax,
  setSceneZoomEndMin,
  setSceneZoomEndMax
} from '../../store/scene/actions'
import {
  selectSceneHasBPM,
  selectSceneZoomTF,
  selectSceneZoomDuration,
  selectSceneZoomDurationMin,
  selectSceneZoomDurationMax,
  selectSceneZoomSinRate,
  selectSceneZoomBPMMulti,
  selectSceneTransEase,
  selectSceneTransExp,
  selectSceneTransOv,
  selectSceneTransAmp,
  selectSceneTransPer,
  selectSceneHorizTransType,
  selectSceneHorizTransRandom,
  selectSceneHorizTransLevel,
  selectSceneHorizTransLevelMin,
  selectSceneHorizTransLevelMax,
  selectSceneVertTransType,
  selectSceneVertTransRandom,
  selectSceneVertTransLevel,
  selectSceneVertTransLevelMin,
  selectSceneVertTransLevelMax,
  selectSceneZoom,
  selectSceneZoomRandom,
  selectSceneZoomStart,
  selectSceneZoomEnd,
  selectSceneZoomStartMin,
  selectSceneZoomStartMax,
  selectSceneZoomEndMin,
  selectSceneZoomEndMax
} from '../../store/scene/selectors'
import BaseSwitch from '../common/BaseSwitch'
import { useAppSelector } from '../../store/hooks'

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: '100%'
    },
    paddingLeft: {
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(1)
      }
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
    backdropTop: {
      zIndex: `${theme.zIndex.modal + 1} !important` as any
    },
    highlight: {
      borderWidth: 2,
      borderColor: theme.palette.secondary.main,
      borderStyle: 'solid'
    },
    disable: {
      pointerEvents: 'none'
    }
  })

export interface ZoomMoveCardProps extends WithStyles<typeof styles> {
  sceneID?: number
}

function ZoomMoveCard(props: ZoomMoveCardProps) {
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const tutorial = useAppSelector(selectAppTutorial())
  const easingControls = useAppSelector(
    selectAppConfigDisplaySettingsEasingControls()
  )
  const zoom = useAppSelector(selectSceneZoom(props.sceneID))
  const zoomRandom = useAppSelector(selectSceneZoomRandom(props.sceneID))
  const horizTransType = useAppSelector(
    selectSceneHorizTransType(props.sceneID)
  )
  const vertTransType = useAppSelector(selectSceneVertTransType(props.sceneID))
  const enabled =
    zoom || horizTransType !== HTF.none || vertTransType !== VTF.none

  const classes = props.classes
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid
        item
        xs={12}
        className={clsx(
          tutorial != null &&
            tutorial !== SDT.zoom1 &&
            tutorial !== SDT.zoom2 &&
            classes.disable
        )}
      >
        <Grid container alignItems="center">
          <Grid item xs={12} sm={sidebar ? 12 : 5}>
            <BaseSwitch
              label="Zoom"
              selector={selectSceneZoom(props.sceneID)}
              action={setSceneZoom(props.sceneID)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={sidebar ? 12 : 7}
            className={clsx(tutorial != null && classes.disable)}
          >
            <Collapse
              in={zoom}
              className={clsx(classes.fullWidth, classes.paddingLeft)}
            >
              <BaseSwitch
                label="Randomize Zoom"
                size="small"
                selector={selectSceneZoomRandom(props.sceneID)}
                action={setSceneZoomRandom(props.sceneID)}
              />
            </Collapse>
          </Grid>
        </Grid>
        <Collapse
          in={zoom && !zoomRandom}
          className={clsx(
            classes.fullWidth,
            tutorial === SDT.zoom2 && classes.highlight
          )}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={sidebar ? 12 : 6}>
              <BaseSlider
                min={1}
                max={50}
                scale={10}
                format={{
                  type: 'times',
                  divideBy: 10
                }}
                labelledBy="zoom-start-slider"
                label={{
                  text: 'Zoom Start:',
                  variant: 'body1',
                  color: 'text.primary',
                  appendValue: true
                }}
                selector={selectSceneZoomStart(props.sceneID)}
                action={setSceneZoomStart(props.sceneID)}
              />
            </Grid>
            <Grid item xs={12} sm={sidebar ? 12 : 6}>
              <BaseSlider
                min={1}
                max={50}
                scale={10}
                format={{
                  type: 'times',
                  divideBy: 10
                }}
                labelledBy="zoom-end-slider"
                label={{
                  text: 'Zoom End:',
                  variant: 'body1',
                  color: 'text.primary',
                  appendValue: true
                }}
                selector={selectSceneZoomEnd(props.sceneID)}
                action={setSceneZoomEnd(props.sceneID)}
              />
            </Grid>
          </Grid>
        </Collapse>
        <Collapse in={zoom && zoomRandom} className={classes.fullWidth}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={sidebar ? 12 : 6}>
              <BaseSlider
                min={1}
                max={50}
                scale={10}
                format={{
                  type: 'times',
                  divideBy: 10
                }}
                labelledBy="zoom-start-min-slider"
                label={{
                  text: 'Zoom Start Min:',
                  variant: 'body1',
                  color: 'text.primary',
                  appendValue: true
                }}
                selector={selectSceneZoomStartMin(props.sceneID)}
                action={setSceneZoomStartMin(props.sceneID)}
              />
            </Grid>
            <Grid item xs={12} sm={sidebar ? 12 : 6}>
              <BaseSlider
                min={1}
                max={50}
                scale={10}
                format={{
                  type: 'times',
                  divideBy: 10
                }}
                labelledBy="zoom-start-max-slider"
                label={{
                  text: 'Zoom Start Max:',
                  variant: 'body1',
                  color: 'text.primary',
                  appendValue: true
                }}
                selector={selectSceneZoomStartMax(props.sceneID)}
                action={setSceneZoomStartMax(props.sceneID)}
              />
            </Grid>
            <Grid item xs={12} sm={sidebar ? 12 : 6}>
              <BaseSlider
                min={1}
                max={50}
                scale={10}
                format={{
                  type: 'times',
                  divideBy: 10
                }}
                labelledBy="zoom-end-min-slider"
                label={{
                  text: 'Zoom End Min:',
                  variant: 'body1',
                  color: 'text.primary',
                  appendValue: true
                }}
                selector={selectSceneZoomEndMin(props.sceneID)}
                action={setSceneZoomEndMin(props.sceneID)}
              />
            </Grid>
            <Grid item xs={12} sm={sidebar ? 12 : 6}>
              <BaseSlider
                min={1}
                max={50}
                scale={10}
                format={{
                  type: 'times',
                  divideBy: 10
                }}
                labelledBy="zoom-end-max-slider"
                label={{
                  text: 'Zoom End Max:',
                  variant: 'body1',
                  color: 'text.primary',
                  appendValue: true
                }}
                selector={selectSceneZoomEndMax(props.sceneID)}
                action={setSceneZoomEndMax(props.sceneID)}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Grid item xs={12} className={clsx(!enabled && classes.noPadding)}>
        <Collapse in={enabled} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12} className={clsx(tutorial && classes.disable)}>
        <MoveCard
          sidebar={sidebar}
          enabled={true}
          values={HTF}
          valueMapper={(value: any) => en.get(value)}
          label="Move Horizontally"
          type={{
            selector: selectSceneHorizTransType(props.sceneID),
            action: setSceneHorizTransType(props.sceneID)
          }}
          random={{
            selector: selectSceneHorizTransRandom(props.sceneID),
            action: setSceneHorizTransRandom(props.sceneID)
          }}
          level={{
            selector: selectSceneHorizTransLevel(props.sceneID),
            action: setSceneHorizTransLevel(props.sceneID)
          }}
          levelMin={{
            selector: selectSceneHorizTransLevelMin(props.sceneID),
            action: setSceneHorizTransLevelMin(props.sceneID)
          }}
          levelMax={{
            selector: selectSceneHorizTransLevelMax(props.sceneID),
            action: setSceneHorizTransLevelMax(props.sceneID)
          }}
        />
      </Grid>
      <Grid item xs={12} className={clsx(!enabled && classes.noPadding)}>
        <Collapse in={enabled} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12} className={clsx(tutorial && classes.disable)}>
        <MoveCard
          sidebar={sidebar}
          enabled={true}
          values={VTF}
          valueMapper={(value: any) => en.get(value)}
          label="Move Vertically"
          type={{
            selector: selectSceneVertTransType(props.sceneID),
            action: setSceneVertTransType(props.sceneID)
          }}
          random={{
            selector: selectSceneVertTransRandom(props.sceneID),
            action: setSceneVertTransRandom(props.sceneID)
          }}
          level={{
            selector: selectSceneVertTransLevel(props.sceneID),
            action: setSceneVertTransLevel(props.sceneID)
          }}
          levelMin={{
            selector: selectSceneVertTransLevelMin(props.sceneID),
            action: setSceneVertTransLevelMin(props.sceneID)
          }}
          levelMax={{
            selector: selectSceneVertTransLevelMax(props.sceneID),
            action: setSceneVertTransLevelMax(props.sceneID)
          }}
        />
      </Grid>
      <Grid item xs={12} className={clsx(!enabled && classes.noPadding)}>
        <Collapse in={enabled} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid
        item
        xs={12}
        className={clsx(
          !enabled && classes.noPadding,
          tutorial != null && tutorial !== SDT.zoom3 && classes.disable
        )}
      >
        <Collapse in={enabled} className={classes.fullWidth}>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={selectSceneHasBPM(props.sceneID)}
            timing={{
              selector: selectSceneZoomTF(props.sceneID),
              action: setSceneZoomTF(props.sceneID)
            }}
            duration={{
              selector: selectSceneZoomDuration(props.sceneID),
              action: setSceneZoomDuration(props.sceneID)
            }}
            durationMin={{
              selector: selectSceneZoomDurationMin(props.sceneID),
              action: setSceneZoomDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: selectSceneZoomDurationMax(props.sceneID),
              action: setSceneZoomDurationMax(props.sceneID)
            }}
            wave={{
              selector: selectSceneZoomSinRate(props.sceneID),
              action: setSceneZoomSinRate(props.sceneID),
              labelledBy: 'trans-sin-rate-slider'
            }}
            bpm={{
              selector: selectSceneZoomBPMMulti(props.sceneID),
              action: setSceneZoomBPMMulti(props.sceneID),
              labelledBy: 'trans-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid>
      {easingControls && (
        <React.Fragment>
          <Grid item xs={12} className={clsx(!enabled && classes.noPadding)}>
            <Collapse in={enabled} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid>
          <Grid item xs={12}>
            <Collapse in={enabled} className={classes.fullWidth}>
              <EasingCard
                sidebar={sidebar}
                easing={{
                  selector: selectSceneTransEase(props.sceneID),
                  action: setSceneTransEase(props.sceneID)
                }}
                exponent={{
                  selector: selectSceneTransExp(props.sceneID),
                  action: setSceneTransExp(props.sceneID),
                  labelledBy: 'trans-exp-slider'
                }}
                overshoot={{
                  selector: selectSceneTransOv(props.sceneID),
                  action: setSceneTransOv(props.sceneID),
                  labelledBy: 'trans-ov-slider'
                }}
                amplitude={{
                  selector: selectSceneTransAmp(props.sceneID),
                  action: setSceneTransAmp(props.sceneID),
                  labelledBy: 'trans-amp-slider'
                }}
                period={{
                  selector: selectSceneTransPer(props.sceneID),
                  action: setSceneTransPer(props.sceneID),
                  labelledBy: 'trans-per-slider'
                }}
              />
            </Collapse>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  )
}

;(ZoomMoveCard as any).displayName = 'ZoomMoveCard'
export default withStyles(styles)(ZoomMoveCard as any)
