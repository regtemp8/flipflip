import { cx } from '@emotion/css'

import { Collapse, Divider, Grid2, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { en, HTF, VTF } from 'flipflip-common'
import TimingCard from '../common/TimingCard'
import EasingCard from '../common/EasingCard'
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
} from '../../store/api/thunks'
import {
  useGetScenePanningQuery,
  useGetScenePanTFQuery,
  useGetScenePanDurationQuery,
  useGetScenePanDurationMinQuery,
  useGetScenePanDurationMaxQuery,
  useGetScenePanSinRateQuery,
  useGetScenePanBPMMultiQuery,
  useGetScenePanStartEaseQuery,
  useGetScenePanStartExpQuery,
  useGetScenePanStartOvQuery,
  useGetScenePanStartAmpQuery,
  useGetScenePanStartPerQuery,
  useGetScenePanEndEaseQuery,
  useGetScenePanEndExpQuery,
  useGetScenePanEndOvQuery,
  useGetScenePanEndAmpQuery,
  useGetScenePanEndPerQuery,
  useGetScenePanHorizTransTypeQuery,
  useGetScenePanHorizTransRandomQuery,
  useGetScenePanHorizTransImgQuery,
  useGetScenePanHorizTransLevelQuery,
  useGetScenePanHorizTransLevelMinQuery,
  useGetScenePanHorizTransLevelMaxQuery,
  useGetScenePanVertTransTypeQuery,
  useGetScenePanVertTransRandomQuery,
  useGetScenePanVertTransImgQuery,
  useGetScenePanVertTransLevelQuery,
  useGetScenePanVertTransLevelMinQuery,
  useGetScenePanVertTransLevelMaxQuery,
  useGetDisplaySettingsEasingControlsQuery
} from '../../store/api/selectors'
import {
  useGetSceneHasBPMQuery,
  useGetTutorialsQuery
} from '../../store/api/slice'
import MoveCard from '../common/MoveCard'
import BaseSwitch from '../common/BaseSwitch'
import { useIsPlayerRoute } from '../useIsPlayerRoute'

const useStyles = makeStyles()((theme: Theme) => ({
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
}))

export interface PanningCardProps {
  sceneID: number
}

function PanningCard(props: PanningCardProps) {
  const sidebar = useIsPlayerRoute()
  const { data: tutorial } = useGetTutorialsQuery()
  const { data: easingControls } = useGetDisplaySettingsEasingControlsQuery()
  const { data: panning } = useGetScenePanningQuery(props.sceneID)

  const { classes } = useStyles()
  return (
    <Grid2
      container
      spacing={panning ? 2 : 0}
      alignItems="center"
      className={cx(tutorial?.current != null && classes.disable)}
    >
      <Grid2 size={12}>
        <BaseSwitch
          label="Panning"
          selector={() => useGetScenePanningQuery(props.sceneID)}
          action={setScenePanning(props.sceneID)}
        />
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={panning} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <MoveCard
          sidebar={sidebar}
          enabled={panning === true}
          values={HTF}
          valueMapper={(value: string) => {
            switch (value) {
              case HTF.left:
                return `${en.get(value)} then ${en.get(HTF.right)}`
              case HTF.right:
                return `${en.get(value)} then ${en.get(HTF.left)}`
              case HTF.random:
                return 'Random'
              default:
                return en.get(value) as string
            }
          }}
          label="Move Horizontally"
          type={{
            selector: () => useGetScenePanHorizTransTypeQuery(props.sceneID),
            action: setScenePanHorizTransType(props.sceneID)
          }}
          random={{
            selector: () => useGetScenePanHorizTransRandomQuery(props.sceneID),
            action: setScenePanHorizTransRandom(props.sceneID)
          }}
          imageWidth={{
            selector: () => useGetScenePanHorizTransImgQuery(props.sceneID),
            action: setScenePanHorizTransImg(props.sceneID)
          }}
          level={{
            selector: () => useGetScenePanHorizTransLevelQuery(props.sceneID),
            action: setScenePanHorizTransLevel(props.sceneID)
          }}
          levelMin={{
            selector: () =>
              useGetScenePanHorizTransLevelMinQuery(props.sceneID),
            action: setScenePanHorizTransLevelMin(props.sceneID)
          }}
          levelMax={{
            selector: () =>
              useGetScenePanHorizTransLevelMaxQuery(props.sceneID),
            action: setScenePanHorizTransLevelMax(props.sceneID)
          }}
        />
      </Grid2>
      <Grid2 size={12} className={cx(!panning && classes.noPadding)}>
        <Collapse in={panning} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <MoveCard
          sidebar={sidebar}
          enabled={panning === true}
          values={VTF}
          valueMapper={(value: string) => {
            switch (value) {
              case VTF.up:
                return `${en.get(value)} then ${en.get(VTF.down)}`
              case VTF.down:
                return `${en.get(value)} then ${en.get(VTF.up)}`
              case VTF.random:
                return 'Random'
              default:
                return en.get(value) as string
            }
          }}
          label="Move Vertically"
          type={{
            selector: () => useGetScenePanVertTransTypeQuery(props.sceneID),
            action: setScenePanVertTransType(props.sceneID)
          }}
          random={{
            selector: () => useGetScenePanVertTransRandomQuery(props.sceneID),
            action: setScenePanVertTransRandom(props.sceneID)
          }}
          imageHeight={{
            selector: () => useGetScenePanVertTransImgQuery(props.sceneID),
            action: setScenePanVertTransImg(props.sceneID)
          }}
          level={{
            selector: () => useGetScenePanVertTransLevelQuery(props.sceneID),
            action: setScenePanVertTransLevel(props.sceneID)
          }}
          levelMin={{
            selector: () => useGetScenePanVertTransLevelMinQuery(props.sceneID),
            action: setScenePanVertTransLevelMin(props.sceneID)
          }}
          levelMax={{
            selector: () => useGetScenePanVertTransLevelMaxQuery(props.sceneID),
            action: setScenePanVertTransLevelMax(props.sceneID)
          }}
        />
      </Grid2>
      <Grid2 size={12} className={cx(!panning && classes.noPadding)}>
        <Collapse in={panning} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={panning} className={classes.fullWidth}>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={() => useGetSceneHasBPMQuery(props.sceneID)}
            timing={{
              selector: () => useGetScenePanTFQuery(props.sceneID),
              action: setScenePanTF(props.sceneID)
            }}
            duration={{
              selector: () => useGetScenePanDurationQuery(props.sceneID),
              action: setScenePanDuration(props.sceneID)
            }}
            durationMin={{
              selector: () => useGetScenePanDurationMinQuery(props.sceneID),
              action: setScenePanDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: () => useGetScenePanDurationMaxQuery(props.sceneID),
              action: setScenePanDurationMax(props.sceneID)
            }}
            wave={{
              selector: () => useGetScenePanSinRateQuery(props.sceneID),
              action: setScenePanSinRate(props.sceneID),
              labelledBy: 'pan-sin-rate-slider'
            }}
            bpm={{
              selector: () => useGetScenePanBPMMultiQuery(props.sceneID),
              action: setScenePanBPMMulti(props.sceneID),
              labelledBy: 'pan-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid2>
      {easingControls && (
        <>
          <Grid2 size={12} className={cx(!panning && classes.noPadding)}>
            <Collapse in={panning} className={classes.fullWidth}>
              <Divider />
            </Collapse>
          </Grid2>
          <Grid2 size={12}>
            <Collapse in={panning} className={classes.fullWidth}>
              <EasingCard
                label="Start Easing"
                sidebar={sidebar}
                easing={{
                  selector: () => useGetScenePanStartEaseQuery(props.sceneID),
                  action: setScenePanStartEase(props.sceneID)
                }}
                exponent={{
                  selector: () => useGetScenePanStartExpQuery(props.sceneID),
                  action: setScenePanStartExp(props.sceneID),
                  labelledBy: 'pan-start-exp-slider'
                }}
                overshoot={{
                  selector: () => useGetScenePanStartOvQuery(props.sceneID),
                  action: setScenePanStartOv(props.sceneID),
                  labelledBy: 'pan-start-ov-slider'
                }}
                amplitude={{
                  selector: () => useGetScenePanStartAmpQuery(props.sceneID),
                  action: setScenePanStartAmp(props.sceneID),
                  labelledBy: 'pan-start-amp-slider'
                }}
                period={{
                  selector: () => useGetScenePanStartPerQuery(props.sceneID),
                  action: setScenePanStartPer(props.sceneID),
                  labelledBy: 'pan-start-per-slider'
                }}
              />
              <EasingCard
                label="End Easing"
                sidebar={sidebar}
                easing={{
                  selector: () => useGetScenePanEndEaseQuery(props.sceneID),
                  action: setScenePanEndEase(props.sceneID)
                }}
                exponent={{
                  selector: () => useGetScenePanEndExpQuery(props.sceneID),
                  action: setScenePanEndExp(props.sceneID),
                  labelledBy: 'pan-end-exp-slider'
                }}
                overshoot={{
                  selector: () => useGetScenePanEndOvQuery(props.sceneID),
                  action: setScenePanEndOv(props.sceneID),
                  labelledBy: 'pan-end-ov-slider'
                }}
                amplitude={{
                  selector: () => useGetScenePanEndAmpQuery(props.sceneID),
                  action: setScenePanEndAmp(props.sceneID),
                  labelledBy: 'pan-end-amp-slider'
                }}
                period={{
                  selector: () => useGetScenePanEndPerQuery(props.sceneID),
                  action: setScenePanEndPer(props.sceneID),
                  labelledBy: 'pan-end-per-slider'
                }}
              />
            </Collapse>
          </Grid2>
        </>
      )}
    </Grid2>
  )
}

;(PanningCard as any).displayName = 'PanningCard'
export default PanningCard
