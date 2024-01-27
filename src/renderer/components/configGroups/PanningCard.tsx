import * as React from 'react'
import clsx from 'clsx'

import { Collapse, Divider, Grid, type Theme } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { HTF, VTF } from '../../data/const'
import en from '../../data/en'
import TimingCard from '../common/TimingCard'
import EasingCard from '../common/EasingCard'
import {
  selectAppTutorial,
  selectAppConfigDisplaySettingsEasingControls,
  selectAppLastRouteIsPlayer
} from '../../../store/app/selectors'
import {
  setScenePanning,
  setScenePanTF,
  setScenePanDuration,
  setScenePanDurationMin,
  setScenePanDurationMax,
  setScenePanSinRate,
  setScenePanBPMMulti,
  setScenePanStartEase,
  setScenePanStartExp,
  setScenePanStartOv,
  setScenePanStartAmp,
  setScenePanStartPer,
  setScenePanEndEase,
  setScenePanEndExp,
  setScenePanEndOv,
  setScenePanEndAmp,
  setScenePanEndPer,
  setScenePanHorizTransType,
  setScenePanHorizTransRandom,
  setScenePanHorizTransImg,
  setScenePanHorizTransLevel,
  setScenePanHorizTransLevelMin,
  setScenePanHorizTransLevelMax,
  setScenePanVertTransType,
  setScenePanVertTransRandom,
  setScenePanVertTransImg,
  setScenePanVertTransLevel,
  setScenePanVertTransLevelMin,
  setScenePanVertTransLevelMax
} from '../../../store/scene/actions'
import {
  selectSceneHasBPM,
  selectScenePanning,
  selectScenePanTF,
  selectScenePanDuration,
  selectScenePanDurationMin,
  selectScenePanDurationMax,
  selectScenePanSinRate,
  selectScenePanBPMMulti,
  selectScenePanStartEase,
  selectScenePanStartExp,
  selectScenePanStartOv,
  selectScenePanStartAmp,
  selectScenePanStartPer,
  selectScenePanEndEase,
  selectScenePanEndExp,
  selectScenePanEndOv,
  selectScenePanEndAmp,
  selectScenePanEndPer,
  selectScenePanHorizTransType,
  selectScenePanHorizTransRandom,
  selectScenePanHorizTransImg,
  selectScenePanHorizTransLevel,
  selectScenePanHorizTransLevelMin,
  selectScenePanHorizTransLevelMax,
  selectScenePanVertTransType,
  selectScenePanVertTransRandom,
  selectScenePanVertTransImg,
  selectScenePanVertTransLevel,
  selectScenePanVertTransLevelMin,
  selectScenePanVertTransLevelMax
} from '../../../store/scene/selectors'
import MoveCard from '../common/MoveCard'
import BaseSwitch from '../common/BaseSwitch'
import { useAppSelector } from '../../../store/hooks'

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
    },
    noPadding: {
      padding: '0 !important'
    }
  })

export interface PanningCardProps extends WithStyles<typeof styles> {
  sceneID?: number
}

function PanningCard(props: PanningCardProps) {
  const sidebar = useAppSelector(selectAppLastRouteIsPlayer())
  const panning = useAppSelector(selectScenePanning(props.sceneID))
  const tutorial = useAppSelector(selectAppTutorial())
  const easingControls = useAppSelector(
    selectAppConfigDisplaySettingsEasingControls()
  )

  const classes = props.classes
  return (
    <Grid
      container
      spacing={panning ? 2 : 0}
      alignItems="center"
      className={clsx(tutorial != null && classes.disable)}
    >
      <Grid item xs={12}>
        <BaseSwitch
          label="Panning"
          selector={selectScenePanning(props.sceneID)}
          action={setScenePanning(props.sceneID)}
        />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={panning} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <MoveCard
          sidebar={sidebar}
          enabled={panning}
          values={HTF}
          valueMapper={(value: any) => {
            switch (value) {
              case HTF.left:
                return `${en.get(value)} then ${en.get(HTF.right)}`
              case HTF.right:
                return `${en.get(value)} then ${en.get(HTF.left)}`
              case HTF.random:
                return 'Random'
              default:
                return en.get(value)
            }
          }}
          label="Move Horizontally"
          type={{
            selector: selectScenePanHorizTransType(props.sceneID),
            action: setScenePanHorizTransType(props.sceneID)
          }}
          random={{
            selector: selectScenePanHorizTransRandom(props.sceneID),
            action: setScenePanHorizTransRandom(props.sceneID)
          }}
          imageWidth={{
            selector: selectScenePanHorizTransImg(props.sceneID),
            action: setScenePanHorizTransImg(props.sceneID)
          }}
          level={{
            selector: selectScenePanHorizTransLevel(props.sceneID),
            action: setScenePanHorizTransLevel(props.sceneID)
          }}
          levelMin={{
            selector: selectScenePanHorizTransLevelMin(props.sceneID),
            action: setScenePanHorizTransLevelMin(props.sceneID)
          }}
          levelMax={{
            selector: selectScenePanHorizTransLevelMax(props.sceneID),
            action: setScenePanHorizTransLevelMax(props.sceneID)
          }}
        />
      </Grid>
      <Grid item xs={12} className={clsx(!panning && classes.noPadding)}>
        <Collapse in={panning} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <MoveCard
          sidebar={sidebar}
          enabled={panning}
          values={VTF}
          valueMapper={(value: any) => {
            switch (value) {
              case VTF.up:
                return `${en.get(value)} then ${en.get(VTF.down)}`
              case VTF.down:
                return `${en.get(value)} then ${en.get(VTF.up)}`
              case VTF.random:
                return 'Random'
              default:
                return en.get(value)
            }
          }}
          label="Move Vertically"
          type={{
            selector: selectScenePanVertTransType(props.sceneID),
            action: setScenePanVertTransType(props.sceneID)
          }}
          random={{
            selector: selectScenePanVertTransRandom(props.sceneID),
            action: setScenePanVertTransRandom(props.sceneID)
          }}
          imageWidth={{
            selector: selectScenePanVertTransImg(props.sceneID),
            action: setScenePanVertTransImg(props.sceneID)
          }}
          level={{
            selector: selectScenePanVertTransLevel(props.sceneID),
            action: setScenePanVertTransLevel(props.sceneID)
          }}
          levelMin={{
            selector: selectScenePanVertTransLevelMin(props.sceneID),
            action: setScenePanVertTransLevelMin(props.sceneID)
          }}
          levelMax={{
            selector: selectScenePanVertTransLevelMax(props.sceneID),
            action: setScenePanVertTransLevelMax(props.sceneID)
          }}
        />
      </Grid>
      <Grid item xs={12} className={clsx(!panning && classes.noPadding)}>
        <Collapse in={panning} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={panning} className={classes.fullWidth}>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={selectSceneHasBPM(props.sceneID)}
            timing={{
              selector: selectScenePanTF(props.sceneID),
              action: setScenePanTF(props.sceneID)
            }}
            duration={{
              selector: selectScenePanDuration(props.sceneID),
              action: setScenePanDuration(props.sceneID)
            }}
            durationMin={{
              selector: selectScenePanDurationMin(props.sceneID),
              action: setScenePanDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: selectScenePanDurationMax(props.sceneID),
              action: setScenePanDurationMax(props.sceneID)
            }}
            wave={{
              selector: selectScenePanSinRate(props.sceneID),
              action: setScenePanSinRate(props.sceneID),
              labelledBy: 'pan-sin-rate-slider'
            }}
            bpm={{
              selector: selectScenePanBPMMulti(props.sceneID),
              action: setScenePanBPMMulti(props.sceneID),
              labelledBy: 'pan-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid>
      {easingControls && (
        <React.Fragment>
          <Grid item xs={12} className={clsx(!panning && classes.noPadding)}>
            <Collapse in={panning} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid>
          <Grid item xs={12}>
            <Collapse in={panning} className={classes.fullWidth}>
              <EasingCard
                label="Start Easing"
                sidebar={sidebar}
                easing={{
                  selector: selectScenePanStartEase(props.sceneID),
                  action: setScenePanStartEase(props.sceneID)
                }}
                exponent={{
                  selector: selectScenePanStartExp(props.sceneID),
                  action: setScenePanStartExp(props.sceneID),
                  labelledBy: 'pan-start-exp-slider'
                }}
                overshoot={{
                  selector: selectScenePanStartOv(props.sceneID),
                  action: setScenePanStartOv(props.sceneID),
                  labelledBy: 'pan-start-ov-slider'
                }}
                amplitude={{
                  selector: selectScenePanStartAmp(props.sceneID),
                  action: setScenePanStartAmp(props.sceneID),
                  labelledBy: 'pan-start-amp-slider'
                }}
                period={{
                  selector: selectScenePanStartPer(props.sceneID),
                  action: setScenePanStartPer(props.sceneID),
                  labelledBy: 'pan-start-per-slider'
                }}
              />
              <EasingCard
                label="End Easing"
                sidebar={sidebar}
                easing={{
                  selector: selectScenePanEndEase(props.sceneID),
                  action: setScenePanEndEase(props.sceneID)
                }}
                exponent={{
                  selector: selectScenePanEndExp(props.sceneID),
                  action: setScenePanEndExp(props.sceneID),
                  labelledBy: 'pan-end-exp-slider'
                }}
                overshoot={{
                  selector: selectScenePanEndOv(props.sceneID),
                  action: setScenePanEndOv(props.sceneID),
                  labelledBy: 'pan-end-ov-slider'
                }}
                amplitude={{
                  selector: selectScenePanEndAmp(props.sceneID),
                  action: setScenePanEndAmp(props.sceneID),
                  labelledBy: 'pan-end-amp-slider'
                }}
                period={{
                  selector: selectScenePanEndPer(props.sceneID),
                  action: setScenePanEndPer(props.sceneID),
                  labelledBy: 'pan-end-per-slider'
                }}
              />
            </Collapse>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  )
}

;(PanningCard as any).displayName = 'PanningCard'
export default withStyles(styles)(PanningCard as any)
