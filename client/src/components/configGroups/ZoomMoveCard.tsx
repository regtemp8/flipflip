import { cx } from '@emotion/css'

import { Collapse, Divider, Grid2, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import BaseSlider from '../common/slider/BaseSlider'
import { en, HTF, SDT, VTF } from 'flipflip-common'
import TimingCard from '../common/TimingCard'
import MoveCard from '../common/MoveCard'
import EasingCard from '../common/EasingCard'
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
} from '../../store/api/thunks'
import {
  useGetSceneZoomTFQuery,
  useGetSceneZoomDurationQuery,
  useGetSceneZoomDurationMinQuery,
  useGetSceneZoomDurationMaxQuery,
  useGetSceneZoomSinRateQuery,
  useGetSceneZoomBPMMultiQuery,
  useGetSceneTransEaseQuery,
  useGetSceneTransExpQuery,
  useGetSceneTransOvQuery,
  useGetSceneTransAmpQuery,
  useGetSceneTransPerQuery,
  useGetSceneHorizTransTypeQuery,
  useGetSceneHorizTransRandomQuery,
  useGetSceneHorizTransLevelQuery,
  useGetSceneHorizTransLevelMinQuery,
  useGetSceneHorizTransLevelMaxQuery,
  useGetSceneVertTransTypeQuery,
  useGetSceneVertTransRandomQuery,
  useGetSceneVertTransLevelQuery,
  useGetSceneVertTransLevelMinQuery,
  useGetSceneVertTransLevelMaxQuery,
  useGetSceneZoomQuery,
  useGetSceneZoomRandomQuery,
  useGetSceneZoomStartQuery,
  useGetSceneZoomEndQuery,
  useGetSceneZoomStartMinQuery,
  useGetSceneZoomStartMaxQuery,
  useGetSceneZoomEndMinQuery,
  useGetSceneZoomEndMaxQuery,
  useGetDisplaySettingsEasingControlsQuery
} from '../../store/api/selectors'
import {
  useGetSceneHasBPMQuery,
  useGetTutorialsQuery
} from '../../store/api/slice'
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
}))

export interface ZoomMoveCardProps {
  sceneID: number
}

function ZoomMoveCard(props: ZoomMoveCardProps) {
  const sidebar = useIsPlayerRoute()
  const { data: tutorial } = useGetTutorialsQuery()
  const { data: easingControls } = useGetDisplaySettingsEasingControlsQuery()
  const { data: zoom } = useGetSceneZoomQuery(props.sceneID)
  const { data: zoomRandom } = useGetSceneZoomRandomQuery(props.sceneID)
  const { data: horizTransType } = useGetSceneHorizTransTypeQuery(props.sceneID)
  const { data: vertTransType } = useGetSceneVertTransTypeQuery(props.sceneID)
  const enabled =
    zoom || horizTransType !== HTF.none || vertTransType !== VTF.none

  const { classes } = useStyles()
  return (
    <Grid2 container spacing={2} alignItems="center">
      <Grid2
        size={12}
        className={cx(
          tutorial?.current != null &&
            tutorial?.current !== SDT.zoom1 &&
            tutorial?.current !== SDT.zoom2 &&
            classes.disable
        )}
      >
        <Grid2 container alignItems="center">
          <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 5 }}>
            <BaseSwitch
              label="Zoom"
              selector={() => useGetSceneZoomQuery(props.sceneID)}
              action={setSceneZoom(props.sceneID)}
            />
          </Grid2>
          <Grid2
            size={{ xs: 12, sm: sidebar ? 12 : 7 }}
            className={cx(tutorial?.current != null && classes.disable)}
          >
            <Collapse
              in={zoom}
              className={cx(classes.fullWidth, classes.paddingLeft)}
            >
              <BaseSwitch
                label="Randomize Zoom"
                size="small"
                selector={() => useGetSceneZoomRandomQuery(props.sceneID)}
                action={setSceneZoomRandom(props.sceneID)}
              />
            </Collapse>
          </Grid2>
        </Grid2>
        <Collapse
          in={zoom && !zoomRandom}
          className={cx(
            classes.fullWidth,
            tutorial?.current === SDT.zoom2 && classes.highlight
          )}
        >
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 6 }}>
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
                selector={() => useGetSceneZoomStartQuery(props.sceneID)}
                action={setSceneZoomStart(props.sceneID)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 6 }}>
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
                selector={() => useGetSceneZoomEndQuery(props.sceneID)}
                action={setSceneZoomEnd(props.sceneID)}
              />
            </Grid2>
          </Grid2>
        </Collapse>
        <Collapse in={zoom && zoomRandom} className={classes.fullWidth}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 6 }}>
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
                selector={() => useGetSceneZoomStartMinQuery(props.sceneID)}
                action={setSceneZoomStartMin(props.sceneID)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 6 }}>
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
                selector={() => useGetSceneZoomStartMaxQuery(props.sceneID)}
                action={setSceneZoomStartMax(props.sceneID)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 6 }}>
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
                selector={() => useGetSceneZoomEndMinQuery(props.sceneID)}
                action={setSceneZoomEndMin(props.sceneID)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 6 }}>
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
                selector={() => useGetSceneZoomEndMaxQuery(props.sceneID)}
                action={setSceneZoomEndMax(props.sceneID)}
              />
            </Grid2>
          </Grid2>
        </Collapse>
        <Collapse in={zoom} className={classes.fullWidth}>
          <Divider sx={{pt: 2}}/>
        </Collapse>
      </Grid2>
      <Grid2 size={12} className={cx(tutorial?.current && classes.disable)}>
        <MoveCard
          sidebar={sidebar}
          enabled={true}
          values={HTF}
          valueMapper={(value: string) => en.get(value) as string}
          label="Move Horizontally"
          type={{
            selector: () => useGetSceneHorizTransTypeQuery(props.sceneID),
            action: setSceneHorizTransType(props.sceneID)
          }}
          random={{
            selector: () => useGetSceneHorizTransRandomQuery(props.sceneID),
            action: setSceneHorizTransRandom(props.sceneID)
          }}
          level={{
            selector: () => useGetSceneHorizTransLevelQuery(props.sceneID),
            action: setSceneHorizTransLevel(props.sceneID)
          }}
          levelMin={{
            selector: () => useGetSceneHorizTransLevelMinQuery(props.sceneID),
            action: setSceneHorizTransLevelMin(props.sceneID)
          }}
          levelMax={{
            selector: () => useGetSceneHorizTransLevelMaxQuery(props.sceneID),
            action: setSceneHorizTransLevelMax(props.sceneID)
          }}
        />
        <Collapse in={horizTransType !== HTF.none} className={classes.fullWidth}>
          <Divider sx={{pt: 2}}/>
        </Collapse>
      </Grid2>
      <Grid2 size={12} className={cx(tutorial?.current && classes.disable)}>
        <MoveCard
          sidebar={sidebar}
          enabled={true}
          values={VTF}
          valueMapper={(value: string) => en.get(value) as string}
          label="Move Vertically"
          type={{
            selector: () => useGetSceneVertTransTypeQuery(props.sceneID),
            action: setSceneVertTransType(props.sceneID)
          }}
          random={{
            selector: () => useGetSceneVertTransRandomQuery(props.sceneID),
            action: setSceneVertTransRandom(props.sceneID)
          }}
          level={{
            selector: () => useGetSceneVertTransLevelQuery(props.sceneID),
            action: setSceneVertTransLevel(props.sceneID)
          }}
          levelMin={{
            selector: () => useGetSceneVertTransLevelMinQuery(props.sceneID),
            action: setSceneVertTransLevelMin(props.sceneID)
          }}
          levelMax={{
            selector: () => useGetSceneVertTransLevelMaxQuery(props.sceneID),
            action: setSceneVertTransLevelMax(props.sceneID)
          }}
        />
        <Collapse in={vertTransType !== VTF.none} className={classes.fullWidth}>
          <Divider sx={{pt: 2}}/>
        </Collapse>
      </Grid2>
      {enabled && (<Grid2
        size={12}
        className={cx(
          !enabled && classes.noPadding,
          tutorial?.current != null &&
            tutorial?.current !== SDT.zoom3 &&
            classes.disable
        )}
      >
        <Collapse in={enabled} className={classes.fullWidth}>
          <TimingCard
            sidebar={sidebar}
            hasBPMSelector={() => useGetSceneHasBPMQuery(props.sceneID)}
            timing={{
              selector: () => useGetSceneZoomTFQuery(props.sceneID),
              action: setSceneZoomTF(props.sceneID)
            }}
            duration={{
              selector: () => useGetSceneZoomDurationQuery(props.sceneID),
              action: setSceneZoomDuration(props.sceneID)
            }}
            durationMin={{
              selector: () => useGetSceneZoomDurationMinQuery(props.sceneID),
              action: setSceneZoomDurationMin(props.sceneID)
            }}
            durationMax={{
              selector: () => useGetSceneZoomDurationMaxQuery(props.sceneID),
              action: setSceneZoomDurationMax(props.sceneID)
            }}
            wave={{
              selector: () => useGetSceneZoomSinRateQuery(props.sceneID),
              action: setSceneZoomSinRate(props.sceneID),
              labelledBy: 'trans-sin-rate-slider'
            }}
            bpm={{
              selector: () => useGetSceneZoomBPMMultiQuery(props.sceneID),
              action: setSceneZoomBPMMulti(props.sceneID),
              labelledBy: 'trans-bpm-multi-slider'
            }}
          />
        </Collapse>
      </Grid2>)}
      {easingControls && enabled && (
        <Grid2 size={12}>
          <Collapse in={enabled} className={classes.fullWidth}>
            <Divider sx={{mb: 2}}/>
            <EasingCard
              sidebar={sidebar}
              easing={{
                selector: () => useGetSceneTransEaseQuery(props.sceneID),
                action: setSceneTransEase(props.sceneID)
              }}
              exponent={{
                selector: () => useGetSceneTransExpQuery(props.sceneID),
                action: setSceneTransExp(props.sceneID),
                labelledBy: 'trans-exp-slider'
              }}
              overshoot={{
                selector: () => useGetSceneTransOvQuery(props.sceneID),
                action: setSceneTransOv(props.sceneID),
                labelledBy: 'trans-ov-slider'
              }}
              amplitude={{
                selector: () => useGetSceneTransAmpQuery(props.sceneID),
                action: setSceneTransAmp(props.sceneID),
                labelledBy: 'trans-amp-slider'
              }}
              period={{
                selector: () => useGetSceneTransPerQuery(props.sceneID),
                action: setSceneTransPer(props.sceneID),
                labelledBy: 'trans-per-slider'
              }}
            />
          </Collapse>
        </Grid2>
      )}
    </Grid2>
  )
}

;(ZoomMoveCard as any).displayName = 'ZoomMoveCard'
export default ZoomMoveCard
