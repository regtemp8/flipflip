import * as React from 'react'
import { cx } from '@emotion/css'

import {
  Collapse,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  MenuItem,
  type Theme
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import VolumeDownIcon from '@mui/icons-material/VolumeDown'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import { en, GO, IF, OF, OT, SDT, SOF, VO, WF } from 'flipflip-common'
import BaseSelect from '../common/BaseSelect'
import {
  selectAppTutorial,
  selectAppLastRouteIsConfig,
  selectAppLastRouteIsPlayer
} from '../../store/app/selectors'
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
} from '../../store/scene/actions'
import {
  selectSceneImageTypeFilter,
  selectSceneImageOrientation,
  selectSceneGifOption,
  selectSceneVideoOption,
  selectSceneVideoOrientation,
  selectSceneRegenerate,
  selectSceneFullSource,
  selectSceneVideoSpeed,
  selectSceneVideoRandomSpeed,
  selectSceneVideoSpeedMin,
  selectSceneVideoSpeedMax,
  selectSceneVideoSkip,
  selectSceneVideoVolume,
  selectSceneRandomVideoStart,
  selectSceneContinueVideo,
  selectScenePlayVideoClips,
  selectSceneForceAllSource,
  selectSceneForceAll,
  selectSceneGifTimingConstant,
  selectSceneGifTimingMin,
  selectSceneGifTimingMax,
  selectSceneVideoTimingConstant,
  selectSceneVideoTimingMin,
  selectSceneVideoTimingMax,
  selectSceneSkipVideoStart,
  selectSceneSkipVideoEnd,
  selectSceneWeightFunction,
  selectSceneSourceOrderFunction,
  selectSceneOrderFunction,
  selectSceneDisableWeightOptions,
  selectSceneHasGeneratorWeights
} from '../../store/scene/selectors'
import { useAppSelector } from '../../store/hooks'
import BaseSwitch from '../common/BaseSwitch'
import BaseSlider from '../common/slider/BaseSlider'
import MillisTextField from '../common/text/MillisTextField'
import BaseRadioGroup from '../common/BaseRadioGroup'

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
  sceneID?: number
}

function ImageVideoCard(props: ImageVideoCardProps) {
  const { classes } = useStyles()

  const isConfig = useAppSelector(selectAppLastRouteIsConfig())
  const isPlayer = useAppSelector(selectAppLastRouteIsPlayer())
  const sidebar = isPlayer
  const tutorial = useAppSelector(selectAppTutorial())
  const imageTypeFilter = useAppSelector(
    selectSceneImageTypeFilter(props.sceneID)
  )
  const gifOption = useAppSelector(selectSceneGifOption(props.sceneID))
  const videoOption = useAppSelector(selectSceneVideoOption(props.sceneID))
  const disableWeightOptions = useAppSelector(
    selectSceneDisableWeightOptions(props.sceneID)
  )
  const hasGeneratorWeights = useAppSelector(
    selectSceneHasGeneratorWeights(props.sceneID)
  )
  const videoRandomSpeed = useAppSelector(
    selectSceneVideoRandomSpeed(props.sceneID)
  )
  const playVideoClips = useAppSelector(
    selectScenePlayVideoClips(props.sceneID)
  )
  const weightFunction = useAppSelector(
    selectSceneWeightFunction(props.sceneID)
  )
  const sourceOrderFunction = useAppSelector(
    selectSceneSourceOrderFunction(props.sceneID)
  )
  const orderFunction = useAppSelector(selectSceneOrderFunction(props.sceneID))
  return (
    <Grid container alignItems="center">
      {!isPlayer && (
        <Grid
          container
          spacing={2}
          alignItems="center"
          className={cx(
            classes.gutterBottom,
            tutorial === SDT.imageOptions && classes.highlight
          )}
        >
          {(hasGeneratorWeights || isConfig) && (
            <Grid item xs={12}>
              <BaseSwitch
                label="Re-Generate on Playback"
                tooltip="When enabled, this scene will be automatically regenerated with each playback"
                selector={selectSceneRegenerate(props.sceneID)}
                action={setSceneRegenerate(props.sceneID)}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={sidebar ? 12 : 6}>
            <BaseSelect
              label="Image Filter"
              controlClassName={classes.fullWidth}
              selector={selectSceneImageTypeFilter(props.sceneID)}
              action={setSceneImageTypeFilter(props.sceneID)}
            >
              {Object.values(IF).map((tf) => (
                <MenuItem key={tf} value={tf}>
                  {en.get(tf)}
                </MenuItem>
              ))}
            </BaseSelect>
          </Grid>
          <Grid item xs={12} sm={sidebar ? 12 : 6}>
            <Collapse in={weightFunction === WF.sources}>
              <BaseSwitch
                label="Play Full Sources"
                tooltip="Play all images in a source before proceeding to the next one"
                selector={selectSceneFullSource(props.sceneID)}
                action={setSceneFullSource(props.sceneID)}
              />
            </Collapse>
          </Grid>
          <Grid
            item
            xs={12}
            sm={sidebar ? 12 : 6}
            className={cx(imageTypeFilter === IF.videos && classes.noPadding)}
          >
            <Collapse in={imageTypeFilter !== IF.videos}>
              <BaseSelect
                label="Image Orientation"
                controlClassName={classes.fullWidth}
                selector={selectSceneImageOrientation(props.sceneID)}
                action={setSceneImageOrientation(props.sceneID)}
              >
                {Object.values(OT).map((tf) => (
                  <MenuItem key={tf} value={tf}>
                    {en.get(tf)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={6} className={classes.noPadding}></Grid>
          <Grid
            item
            xs={12}
            sm={sidebar ? 12 : 6}
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
                selector={selectSceneGifOption(props.sceneID)}
                action={setSceneGifOption(props.sceneID)}
              >
                {Object.values(GO).map((tf) => (
                  <MenuItem key={tf} value={tf}>
                    {en.get(tf)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Collapse>
          </Grid>
          <Grid
            item
            xs={12}
            sm={sidebar ? 12 : 6}
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
                selector={selectSceneGifTimingConstant(props.sceneID)}
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
                selector={selectSceneGifTimingMin(props.sceneID)}
                action={setSceneGifTimingMin(props.sceneID)}
              />
              <MillisTextField
                label="and"
                selector={selectSceneGifTimingMax(props.sceneID)}
                action={setSceneGifTimingMax(props.sceneID)}
              />
            </Collapse>
          </Grid>
        </Grid>
      )}
      <Grid
        container
        spacing={2}
        alignItems="center"
        className={cx(tutorial === SDT.videoOptions && classes.highlight)}
      >
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 6}
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
              selector={selectSceneVideoOption(props.sceneID)}
              action={setSceneVideoOption(props.sceneID)}
            >
              {Object.values(VO).map((tf) => (
                <MenuItem key={tf} value={tf}>
                  {en.get(tf)}
                </MenuItem>
              ))}
            </BaseSelect>
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 6}
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
              selector={selectSceneVideoTimingConstant(props.sceneID)}
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
              selector={selectSceneVideoTimingMin(props.sceneID)}
              action={setSceneVideoTimingMin(props.sceneID)}
            />
            <MillisTextField
              label="and"
              selector={selectSceneVideoTimingMax(props.sceneID)}
              action={setSceneVideoTimingMax(props.sceneID)}
            />
          </Collapse>
        </Grid>
        {!isPlayer && (
          <React.Fragment>
            <Grid
              item
              xs={12}
              sm={sidebar ? 12 : 6}
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
                  selector={selectSceneVideoOrientation(props.sceneID)}
                  action={setSceneVideoOrientation(props.sceneID)}
                >
                  {Object.values(OT).map((tf) => (
                    <MenuItem key={tf} value={tf}>
                      {en.get(tf)}
                    </MenuItem>
                  ))}
                </BaseSelect>
              </Collapse>
            </Grid>
            <Grid item xs={12} sm={6} className={classes.noPadding}></Grid>
          </React.Fragment>
        )}
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 8}
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
              selector={selectSceneVideoSpeed(props.sceneID)}
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
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <BaseSlider
                  min={1}
                  max={40}
                  selector={selectSceneVideoSpeedMin(props.sceneID)}
                  action={setSceneVideoSpeedMin(props.sceneID)}
                  labelledBy="video-speed-min-slider"
                  format={{ type: 'times', divideBy: 10 }}
                  label={{ text: 'Video Speed Min:', appendValue: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <BaseSlider
                  min={1}
                  max={40}
                  selector={selectSceneVideoSpeedMax(props.sceneID)}
                  action={setSceneVideoSpeedMax(props.sceneID)}
                  labelledBy="video-speed-max-slider"
                  format={{ type: 'times', divideBy: 10 }}
                  label={{ text: 'Video Speed Max:', appendValue: true }}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 4}
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
              selector={selectSceneVideoRandomSpeed(props.sceneID)}
              action={setSceneVideoRandomSpeed(props.sceneID)}
            />
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
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
              selector={selectSceneVideoSkip(props.sceneID)}
              action={setSceneVideoSkip(props.sceneID)}
              labelledBy="video-skip-slider"
              format={{ type: 'second' }}
              label={{ text: 'Video Skip Rate:', appendValue: true }}
            />
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 4}
          md={sidebar ? 12 : 6}
          lg={sidebar ? 12 : 4}
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
              selector={selectSceneRandomVideoStart(props.sceneID)}
              action={setSceneRandomVideoStart(props.sceneID)}
            />
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 4}
          md={sidebar ? 12 : 6}
          lg={sidebar ? 12 : 4}
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
              selector={selectSceneContinueVideo(props.sceneID)}
              action={setSceneContinueVideo(props.sceneID)}
            />
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 4}
          md={sidebar ? 12 : 6}
          lg={sidebar ? 12 : 4}
          className={classes.noPadding}
        ></Grid>
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 4}
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
              selector={selectScenePlayVideoClips(props.sceneID)}
              action={setScenePlayVideoClips(props.sceneID)}
            />
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 4}
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
              selector={selectSceneSkipVideoStart(props.sceneID)}
              action={setSceneSkipVideoStart(props.sceneID)}
            />
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 4}
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
              selector={selectSceneSkipVideoEnd(props.sceneID)}
              action={setSceneSkipVideoEnd(props.sceneID)}
            />
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          className={cx(
            imageTypeFilter === IF.stills &&
              imageTypeFilter === IF.images &&
              classes.noPadding
          )}
        >
          <Collapse
            in={imageTypeFilter !== IF.stills && imageTypeFilter !== IF.images}
          >
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <VolumeDownIcon />
              </Grid>
              <Grid item xs>
                <BaseSlider
                  selector={selectSceneVideoVolume(props.sceneID)}
                  action={setSceneVideoVolume(props.sceneID)}
                  labelledBy="video-volume-slider"
                  min={0}
                  max={100}
                />
              </Grid>
              <Grid item>
                <VolumeUpIcon />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        alignItems="center"
        className={classes.gutterBottom}
      >
        <Grid item xs={12}>
          <Divider />
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="center">
        {!isPlayer && (
          <Grid
            item
            xs={12}
            sm={sidebar ? 12 : 4}
            className={cx(tutorial === SDT.weighting && classes.highlight)}
          >
            <FormControl variant="standard" component="fieldset">
              <FormLabel component="legend">Weighting</FormLabel>
              <BaseRadioGroup
                values={WF}
                disabled={disableWeightOptions}
                selector={selectSceneWeightFunction(props.sceneID)}
                action={setSceneWeightFunction(props.sceneID)}
              />
            </FormControl>
          </Grid>
        )}
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 4}
          className={cx(tutorial === SDT.sordering && classes.highlight)}
        >
          <FormControl variant="standard" component="fieldset">
            <FormLabel component="legend">Source Ordering</FormLabel>
            <BaseRadioGroup
              values={SOF}
              disabled={weightFunction === WF.images || disableWeightOptions}
              selector={selectSceneSourceOrderFunction(props.sceneID)}
              action={setSceneSourceOrderFunction(props.sceneID)}
            />
          </FormControl>
          <Collapse in={sourceOrderFunction === SOF.random}>
            <BaseSwitch
              label="Avoid Repeats"
              size="small"
              disabled={weightFunction === WF.images || disableWeightOptions}
              selector={selectSceneForceAllSource(props.sceneID)}
              action={setSceneForceAllSource(props.sceneID)}
            />
          </Collapse>
        </Grid>
        <Grid
          item
          xs={12}
          sm={sidebar ? 12 : 4}
          className={cx(tutorial === SDT.ordering && classes.highlight)}
        >
          <FormControl variant="standard" component="fieldset">
            <FormLabel component="legend">Image Ordering</FormLabel>
            <BaseRadioGroup
              values={OF}
              selector={selectSceneOrderFunction(props.sceneID)}
              action={setSceneOrderFunction(props.sceneID)}
            />
          </FormControl>
          <Collapse in={orderFunction === OF.random}>
            <BaseSwitch
              label="Avoid Repeats"
              size="small"
              selector={selectSceneForceAll(props.sceneID)}
              action={setSceneForceAll(props.sceneID)}
            />
          </Collapse>
        </Grid>
      </Grid>
    </Grid>
  )
}

;(ImageVideoCard as any).displayName = 'ImageVideoCard'
export default ImageVideoCard
