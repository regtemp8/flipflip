import * as React from 'react'
import { cx } from '@emotion/css'

import {
  Collapse,
  Divider,
  FormControl,
  FormLabel,
  Grid2,
  MenuItem,
  type Theme
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import VolumeDownIcon from '@mui/icons-material/VolumeDown'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import { en, GO, IF, OF, OT, SDT, SOF, VO, WF } from 'flipflip-common'
import BaseSelect from '../common/BaseSelect'
import {
  setSceneImageTypeFilter,
  setSceneImageOrientation,
  setSceneGifOption,
  setSceneVideoOption,
  setSceneVideoOrientation,
  setSceneRegenerate,
  setSceneFullSource,
  setSceneVideoSpeed,
  setSceneVideoRandomSpeed,
  setSceneVideoSpeedMin,
  setSceneVideoSpeedMax,
  setSceneVideoSkip,
  setSceneVideoVolume,
  setSceneRandomVideoStart,
  setSceneContinueVideo,
  setScenePlayVideoClips,
  setSceneForceAllSource,
  setSceneForceAll,
  setSceneGifTimingConstant,
  setSceneGifTimingMin,
  setSceneGifTimingMax,
  setSceneVideoTimingConstant,
  setSceneVideoTimingMin,
  setSceneVideoTimingMax,
  setSceneSkipVideoStart,
  setSceneSkipVideoEnd,
  setSceneWeightFunction,
  setSceneSourceOrderFunction,
  setSceneOrderFunction
} from '../../store/api/thunks'
import {
  useGetSceneImageTypeFilterQuery,
  useGetSceneImageOrientationQuery,
  useGetSceneGifOptionQuery,
  useGetSceneVideoOptionQuery,
  useGetSceneVideoOrientationQuery,
  useGetSceneRegenerateQuery,
  useGetSceneFullSourceQuery,
  useGetSceneVideoSpeedQuery,
  useGetSceneVideoRandomSpeedQuery,
  useGetSceneVideoSpeedMinQuery,
  useGetSceneVideoSpeedMaxQuery,
  useGetSceneVideoSkipQuery,
  useGetSceneVideoVolumeQuery,
  useGetSceneRandomVideoStartQuery,
  useGetSceneContinueVideoQuery,
  useGetScenePlayVideoClipsQuery,
  useGetSceneForceAllSourceQuery,
  useGetSceneForceAllQuery,
  useGetSceneGifTimingConstantQuery,
  useGetSceneGifTimingMinQuery,
  useGetSceneGifTimingMaxQuery,
  useGetSceneVideoTimingConstantQuery,
  useGetSceneVideoTimingMinQuery,
  useGetSceneVideoTimingMaxQuery,
  useGetSceneSkipVideoStartQuery,
  useGetSceneSkipVideoEndQuery,
  useGetSceneWeightFunctionQuery,
  useGetSceneSourceOrderFunctionQuery,
  useGetSceneOrderFunctionQuery,
  useGetSceneHasGeneratorWeightsQuery
} from '../../store/api/selectors'
import BaseSwitch from '../common/BaseSwitch'
import BaseSlider from '../common/slider/BaseSlider'
import MillisTextField from '../common/text/MillisTextField'
import BaseRadioGroup from '../common/BaseRadioGroup'
import {
  useGetSceneDisableWeightOptionsQuery,
  useGetTutorialsQuery
} from '../../store/api/slice'
import { useLocation } from 'react-router-dom'
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
  gutterBottom: {
    marginBottom: theme.spacing(2)
  },
  backdropTop: {
    zIndex: theme.zIndex.modal + 1
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

export interface ImageVideoCardProps {
  sceneID: number
}

function ImageVideoCard(props: ImageVideoCardProps) {
  const { classes } = useStyles()

  const location = useLocation()
  const isConfig = location.pathname.startsWith('/settings/')
  const isPlayer = useIsPlayerRoute()
  const sidebar = isPlayer
  const { data: tutorial } = useGetTutorialsQuery()
  const { data: imageTypeFilter } = useGetSceneImageTypeFilterQuery(
    props.sceneID
  )
  const { data: gifOption } = useGetSceneGifOptionQuery(props.sceneID)
  const { data: videoOption } = useGetSceneVideoOptionQuery(props.sceneID)
  const { data: disableWeightOptions } = useGetSceneDisableWeightOptionsQuery(
    props.sceneID
  )
  const { data: hasGeneratorWeights } = useGetSceneHasGeneratorWeightsQuery(
    props.sceneID
  )
  const { data: videoRandomSpeed } = useGetSceneVideoRandomSpeedQuery(
    props.sceneID
  )
  const { data: playVideoClips } = useGetScenePlayVideoClipsQuery(props.sceneID)
  const { data: weightFunction } = useGetSceneWeightFunctionQuery(props.sceneID)
  const { data: sourceOrderFunction } = useGetSceneSourceOrderFunctionQuery(
    props.sceneID
  )
  const { data: orderFunction } = useGetSceneOrderFunctionQuery(props.sceneID)

  return (
    <Grid2 container alignItems="center">
      {!isPlayer && (
        <Grid2
          container
          spacing={2}
          alignItems="center"
          className={cx(
            classes.gutterBottom,
            tutorial?.current === SDT.imageOptions && classes.highlight
          )}
        >
          {(hasGeneratorWeights || isConfig) && (
            <Grid2 size={12}>
              <BaseSwitch
                label="Re-Generate on Playback"
                tooltip="When enabled, this scene will be automatically regenerated with each playback"
                selector={() => useGetSceneRegenerateQuery(props.sceneID)}
                action={setSceneRegenerate(props.sceneID)}
              />
            </Grid2>
          )}
          <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 6 }}>
            <BaseSelect
              label="Image Filter"
              controlClassName={classes.fullWidth}
              selector={() => useGetSceneImageTypeFilterQuery(props.sceneID)}
              action={setSceneImageTypeFilter(props.sceneID)}
            >
              {Object.values(IF).map((tf) => (
                <MenuItem key={tf} value={tf}>
                  {en.get(tf)}
                </MenuItem>
              ))}
            </BaseSelect>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: sidebar ? 12 : 6 }}>
            <Collapse in={weightFunction === WF.sources}>
              <BaseSwitch
                label="Play Full Sources"
                tooltip="Play all images in a source before proceeding to the next one"
                selector={() => useGetSceneFullSourceQuery(props.sceneID)}
                action={setSceneFullSource(props.sceneID)}
              />
            </Collapse>
          </Grid2>
          <Grid2
            size={{ xs: 12, sm: sidebar ? 12 : 6 }}
            className={cx(imageTypeFilter === IF.videos && classes.noPadding)}
          >
            <Collapse in={imageTypeFilter !== IF.videos}>
              <BaseSelect
                label="Image Orientation"
                controlClassName={classes.fullWidth}
                selector={() => useGetSceneImageOrientationQuery(props.sceneID)}
                action={setSceneImageOrientation(props.sceneID)}
              >
                {Object.values(OT).map((tf) => (
                  <MenuItem key={tf} value={tf}>
                    {en.get(tf)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Collapse>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }} className={classes.noPadding}></Grid2>
          <Grid2
            size={{ xs: 12, sm: sidebar ? 12 : 6 }}
            className={cx(
              (imageTypeFilter === IF.stills ||
                imageTypeFilter === IF.videos) &&
                classes.noPadding
            )}
          >
            <Collapse
              in={
                imageTypeFilter !== IF.stills && imageTypeFilter !== IF.videos
              }
            >
              <BaseSelect
                label="GIF Options"
                controlClassName={classes.fullWidth}
                selector={() => useGetSceneGifOptionQuery(props.sceneID)}
                action={setSceneGifOption(props.sceneID)}
              >
                {Object.values(GO).map((tf) => (
                  <MenuItem key={tf} value={tf}>
                    {en.get(tf)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Collapse>
          </Grid2>
          <Grid2
            size={{ xs: 12, sm: sidebar ? 12 : 6 }}
            className={cx(
              (imageTypeFilter === IF.stills ||
                imageTypeFilter === IF.videos ||
                gifOption === GO.none ||
                gifOption === GO.full) &&
                classes.noPadding
            )}
          >
            <Collapse
              in={
                imageTypeFilter !== IF.stills &&
                imageTypeFilter !== IF.videos &&
                (gifOption === GO.part || gifOption === GO.atLeast)
              }
            >
              <MillisTextField
                label="For"
                selector={() =>
                  useGetSceneGifTimingConstantQuery(props.sceneID)
                }
                action={setSceneGifTimingConstant(props.sceneID)}
              />
            </Collapse>
            <Collapse
              in={
                imageTypeFilter !== IF.stills &&
                imageTypeFilter !== IF.videos &&
                gifOption === GO.partr
              }
            >
              <MillisTextField
                label="Between"
                selector={() => useGetSceneGifTimingMinQuery(props.sceneID)}
                action={setSceneGifTimingMin(props.sceneID)}
              />
              <MillisTextField
                label="and"
                selector={() => useGetSceneGifTimingMaxQuery(props.sceneID)}
                action={setSceneGifTimingMax(props.sceneID)}
              />
            </Collapse>
          </Grid2>
        </Grid2>
      )}
      <Grid2
        container
        spacing={2}
        alignItems="center"
        className={cx(
          tutorial?.current === SDT.videoOptions && classes.highlight
        )}
      >
        <Grid2
          size={{ xs: 12, sm: sidebar ? 12 : 6 }}
          className={cx(
            (imageTypeFilter === IF.stills || imageTypeFilter === IF.images) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={imageTypeFilter !== IF.stills && imageTypeFilter !== IF.images}
          >
            <BaseSelect
              label="Video Options"
              controlClassName={classes.fullWidth}
              selector={() => useGetSceneVideoOptionQuery(props.sceneID)}
              action={setSceneVideoOption(props.sceneID)}
            >
              {Object.values(VO).map((tf) => (
                <MenuItem key={tf} value={tf}>
                  {en.get(tf)}
                </MenuItem>
              ))}
            </BaseSelect>
          </Collapse>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: sidebar ? 12 : 6 }}
          className={cx(
            (imageTypeFilter === IF.stills ||
              imageTypeFilter === IF.images ||
              videoOption === VO.none ||
              videoOption === VO.full) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={
              imageTypeFilter !== IF.stills &&
              imageTypeFilter !== IF.images &&
              (videoOption === VO.part || videoOption === VO.atLeast)
            }
          >
            <MillisTextField
              label="For"
              selector={() =>
                useGetSceneVideoTimingConstantQuery(props.sceneID)
              }
              action={setSceneVideoTimingConstant(props.sceneID)}
            />
          </Collapse>
          <Collapse
            in={
              imageTypeFilter !== IF.stills &&
              imageTypeFilter !== IF.images &&
              videoOption === VO.partr
            }
          >
            <MillisTextField
              label="Between"
              selector={() => useGetSceneVideoTimingMinQuery(props.sceneID)}
              action={setSceneVideoTimingMin(props.sceneID)}
            />
            <MillisTextField
              label="and"
              selector={() => useGetSceneVideoTimingMaxQuery(props.sceneID)}
              action={setSceneVideoTimingMax(props.sceneID)}
            />
          </Collapse>
        </Grid2>
        {!isPlayer && (
          <React.Fragment>
            <Grid2
              size={{ xs: 12, sm: sidebar ? 12 : 6 }}
              className={cx(
                (imageTypeFilter === IF.stills ||
                  imageTypeFilter === IF.images) &&
                  classes.noPadding
              )}
            >
              <Collapse
                in={
                  imageTypeFilter !== IF.stills && imageTypeFilter !== IF.images
                }
              >
                <BaseSelect
                  label="Video Orientation"
                  controlClassName={classes.fullWidth}
                  selector={() =>
                    useGetSceneVideoOrientationQuery(props.sceneID)
                  }
                  action={setSceneVideoOrientation(props.sceneID)}
                >
                  {Object.values(OT).map((tf) => (
                    <MenuItem key={tf} value={tf}>
                      {en.get(tf)}
                    </MenuItem>
                  ))}
                </BaseSelect>
              </Collapse>
            </Grid2>
            <Grid2
              size={{ xs: 12, sm: 6 }}
              className={classes.noPadding}
            ></Grid2>
          </React.Fragment>
        )}
        <Grid2
          size={{ xs: 12, sm: sidebar ? 12 : 8 }}
          className={cx(
            (imageTypeFilter === IF.stills || imageTypeFilter === IF.images) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={
              imageTypeFilter !== IF.stills &&
              imageTypeFilter !== IF.images &&
              !videoRandomSpeed
            }
          >
            <BaseSlider
              min={1}
              max={40}
              selector={() => useGetSceneVideoSpeedQuery(props.sceneID)}
              action={setSceneVideoSpeed(props.sceneID)}
              labelledBy="video-speed-slider"
              format={{ type: 'times', divideBy: 10 }}
              label={{ text: 'Video Speed:', appendValue: true }}
            />
          </Collapse>
          <Collapse
            in={
              imageTypeFilter !== IF.stills &&
              imageTypeFilter !== IF.images &&
              videoRandomSpeed
            }
          >
            <Grid2 container spacing={1}>
              <Grid2 size={6}>
                <BaseSlider
                  min={1}
                  max={40}
                  selector={() => useGetSceneVideoSpeedMinQuery(props.sceneID)}
                  action={setSceneVideoSpeedMin(props.sceneID)}
                  labelledBy="video-speed-min-slider"
                  format={{ type: 'times', divideBy: 10 }}
                  label={{ text: 'Video Speed Min:', appendValue: true }}
                />
              </Grid2>
              <Grid2 size={6}>
                <BaseSlider
                  min={1}
                  max={40}
                  selector={() => useGetSceneVideoSpeedMaxQuery(props.sceneID)}
                  action={setSceneVideoSpeedMax(props.sceneID)}
                  labelledBy="video-speed-max-slider"
                  format={{ type: 'times', divideBy: 10 }}
                  label={{ text: 'Video Speed Max:', appendValue: true }}
                />
              </Grid2>
            </Grid2>
          </Collapse>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: sidebar ? 12 : 4 }}
          className={cx(
            (imageTypeFilter === IF.stills || imageTypeFilter === IF.images) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={imageTypeFilter !== IF.stills && imageTypeFilter !== IF.images}
          >
            <BaseSwitch
              label="Random Speed"
              size="small"
              selector={() => useGetSceneVideoRandomSpeedQuery(props.sceneID)}
              action={setSceneVideoRandomSpeed(props.sceneID)}
            />
          </Collapse>
        </Grid2>
        <Grid2
          size={12}
          className={cx(
            (imageTypeFilter === IF.stills || imageTypeFilter === IF.images) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={imageTypeFilter !== IF.stills && imageTypeFilter !== IF.images}
          >
            <BaseSlider
              min={5}
              max={120}
              marks={[5, 10, 30, 60, 120].map((s) => {
                return { value: s, label: s.toString() }
              })}
              selector={() => useGetSceneVideoSkipQuery(props.sceneID)}
              action={setSceneVideoSkip(props.sceneID)}
              labelledBy="video-skip-slider"
              format={{ type: 'second' }}
              label={{ text: 'Video Skip Rate:', appendValue: true }}
            />
          </Collapse>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            sm: sidebar ? 12 : 4,
            md: sidebar ? 12 : 6,
            lg: sidebar ? 12 : 4
          }}
          className={cx(
            (imageTypeFilter === IF.stills || imageTypeFilter === IF.images) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={imageTypeFilter !== IF.stills && imageTypeFilter !== IF.images}
          >
            <BaseSwitch
              label="Start at Random Time"
              size="small"
              selector={() => useGetSceneRandomVideoStartQuery(props.sceneID)}
              action={setSceneRandomVideoStart(props.sceneID)}
            />
          </Collapse>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            sm: sidebar ? 12 : 4,
            md: sidebar ? 12 : 6,
            lg: sidebar ? 12 : 4
          }}
          className={cx(
            (imageTypeFilter === IF.stills || imageTypeFilter === IF.images) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={imageTypeFilter !== IF.stills && imageTypeFilter !== IF.images}
          >
            <BaseSwitch
              label="Continue Videos"
              tooltip="Each time a video is played, continue from where it left off. Default: Start from beginning"
              size="small"
              selector={() => useGetSceneContinueVideoQuery(props.sceneID)}
              action={setSceneContinueVideo(props.sceneID)}
            />
          </Collapse>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            sm: sidebar ? 12 : 4,
            md: sidebar ? 12 : 6,
            lg: sidebar ? 12 : 4
          }}
          className={classes.noPadding}
        ></Grid2>
        <Grid2
          size={{ xs: 12, sm: sidebar ? 12 : 4 }}
          className={cx(
            (imageTypeFilter === IF.stills || imageTypeFilter === IF.images) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={imageTypeFilter !== IF.stills && imageTypeFilter !== IF.images}
          >
            <BaseSwitch
              label="Use Clips"
              size="small"
              selector={() => useGetScenePlayVideoClipsQuery(props.sceneID)}
              action={setScenePlayVideoClips(props.sceneID)}
            />
          </Collapse>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: sidebar ? 12 : 4 }}
          className={cx(
            (imageTypeFilter === IF.stills ||
              imageTypeFilter === IF.images ||
              playVideoClips) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={
              imageTypeFilter !== IF.stills &&
              imageTypeFilter !== IF.images &&
              !playVideoClips
            }
          >
            <MillisTextField
              label="Skip First"
              selector={() => useGetSceneSkipVideoStartQuery(props.sceneID)}
              action={setSceneSkipVideoStart(props.sceneID)}
            />
          </Collapse>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: sidebar ? 12 : 4 }}
          className={cx(
            (imageTypeFilter === IF.stills ||
              imageTypeFilter === IF.images ||
              playVideoClips) &&
              classes.noPadding
          )}
        >
          <Collapse
            in={
              imageTypeFilter !== IF.stills &&
              imageTypeFilter !== IF.images &&
              !playVideoClips
            }
          >
            <MillisTextField
              label="Skip Last"
              selector={() => useGetSceneSkipVideoEndQuery(props.sceneID)}
              action={setSceneSkipVideoEnd(props.sceneID)}
            />
          </Collapse>
        </Grid2>
        <Grid2
          size={12}
          className={cx(
            imageTypeFilter === IF.stills &&
              imageTypeFilter === IF.images &&
              classes.noPadding
          )}
        >
          <Collapse
            in={imageTypeFilter !== IF.stills && imageTypeFilter !== IF.images}
          >
            <Grid2 container spacing={1} alignItems="center">
              <Grid2>
                <VolumeDownIcon />
              </Grid2>
              <Grid2 size="grow">
                <BaseSlider
                  selector={() => useGetSceneVideoVolumeQuery(props.sceneID)}
                  action={setSceneVideoVolume(props.sceneID)}
                  labelledBy="video-volume-slider"
                  min={0}
                  max={100}
                />
              </Grid2>
              <Grid2>
                <VolumeUpIcon />
              </Grid2>
            </Grid2>
          </Collapse>
        </Grid2>
      </Grid2>
      <Grid2
        container
        spacing={2}
        alignItems="center"
        className={classes.gutterBottom}
      >
        <Grid2 size={12}>
          <Divider />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2} alignItems="center">
        {!isPlayer && (
          <Grid2
            size={{ xs: 12, sm: sidebar ? 12 : 4 }}
            className={cx(
              tutorial?.current === SDT.weighting && classes.highlight
            )}
          >
            <FormControl variant="standard" component="fieldset">
              <FormLabel component="legend">Weighting</FormLabel>
              <BaseRadioGroup
                values={WF}
                disabled={disableWeightOptions}
                selector={() => useGetSceneWeightFunctionQuery(props.sceneID)}
                action={setSceneWeightFunction(props.sceneID)}
              />
            </FormControl>
          </Grid2>
        )}
        <Grid2
          size={{ xs: 12, sm: sidebar ? 12 : 4 }}
          className={cx(
            tutorial?.current === SDT.sordering && classes.highlight
          )}
        >
          <FormControl variant="standard" component="fieldset">
            <FormLabel component="legend">Source Ordering</FormLabel>
            <BaseRadioGroup
              values={SOF}
              disabled={weightFunction === WF.images || disableWeightOptions}
              selector={() =>
                useGetSceneSourceOrderFunctionQuery(props.sceneID)
              }
              action={setSceneSourceOrderFunction(props.sceneID)}
            />
          </FormControl>
          <Collapse in={sourceOrderFunction === SOF.random}>
            <BaseSwitch
              label="Avoid Repeats"
              size="small"
              disabled={weightFunction === WF.images || disableWeightOptions}
              selector={() => useGetSceneForceAllSourceQuery(props.sceneID)}
              action={setSceneForceAllSource(props.sceneID)}
            />
          </Collapse>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: sidebar ? 12 : 4 }}
          className={cx(
            tutorial?.current === SDT.ordering && classes.highlight
          )}
        >
          <FormControl variant="standard" component="fieldset">
            <FormLabel component="legend">Image Ordering</FormLabel>
            <BaseRadioGroup
              values={OF}
              selector={() => useGetSceneOrderFunctionQuery(props.sceneID)}
              action={setSceneOrderFunction(props.sceneID)}
            />
          </FormControl>
          <Collapse in={orderFunction === OF.random}>
            <BaseSwitch
              label="Avoid Repeats"
              size="small"
              selector={() => useGetSceneForceAllQuery(props.sceneID)}
              action={setSceneForceAll(props.sceneID)}
            />
          </Collapse>
        </Grid2>
      </Grid2>
    </Grid2>
  )
}

;(ImageVideoCard as any).displayName = 'ImageVideoCard'
export default ImageVideoCard
