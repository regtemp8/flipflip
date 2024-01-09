import clsx from 'clsx'

import { Card, CardContent, Grid, type Theme } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { SDT } from 'flipflip-common'
import CrossFadeCard from '../configGroups/CrossFadeCard'
import SlideCard from '../configGroups/SlideCard'
import StrobeCard from '../configGroups/StrobeCard'
import ZoomMoveCard from '../configGroups/ZoomMoveCard'
import FadeIOCard from '../configGroups/FadeIOCard'
import PanningCard from '../configGroups/PanningCard'
import { useAppSelector } from '../../store/hooks'
import { selectAppTutorial } from '../../store/app/selectors'

const styles = (theme: Theme) =>
  createStyles({
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
  })

export interface SceneEffectsProps extends WithStyles<typeof styles> {
  sceneID?: number
}

function SceneEffects(props: SceneEffectsProps) {
  const tutorial = useAppSelector(selectAppTutorial())
  const tutorialZoom =
    tutorial === SDT.zoom1 ||
    tutorial === SDT.zoom2 ||
    tutorial === SDT.zoom3 ||
    tutorial === SDT.zoom4
  const tutorialFade = tutorial === SDT.fade1 || tutorial === SDT.fade2
  const classes = props.classes
  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        md={6}
        lg={4}
        className={clsx(tutorialZoom && classes.backdropTop)}
      >
        <Card>
          <CardContent>
            <ZoomMoveCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        lg={4}
        className={clsx(tutorialFade && classes.backdropTop)}
      >
        <Card>
          <CardContent>
            <CrossFadeCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardContent>
            <SlideCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardContent>
            <StrobeCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardContent>
            <FadeIOCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardContent>
            <PanningCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

;(SceneEffects as any).displayName = 'SceneEffects'
export default withStyles(styles)(SceneEffects as any)
