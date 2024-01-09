import clsx from 'clsx'

import { Card, CardContent, Grid, type Theme } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { SDT } from 'flipflip-common'
import ImageVideoCard from '../configGroups/ImageVideoCard'
import SceneOptionCard from '../configGroups/SceneOptionCard'
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
    },
    overflow: {
      overflow: 'inherit'
    }
  })

export interface SceneOptionsProps extends WithStyles<typeof styles> {
  sceneID?: number
}

function SceneOptions(props: SceneOptionsProps) {
  const tutorial = useAppSelector(selectAppTutorial())
  const classes = props.classes
  const tutorial1 =
    tutorial === SDT.optionsLeft ||
    tutorial === SDT.timing ||
    tutorial === SDT.backForth ||
    tutorial === SDT.imageSizing ||
    tutorial === SDT.nextScene ||
    tutorial === SDT.overlays
  const tutorial2 =
    tutorial === SDT.optionsRight ||
    tutorial === SDT.imageOptions ||
    tutorial === SDT.videoOptions ||
    tutorial === SDT.weighting ||
    tutorial === SDT.sordering ||
    tutorial === SDT.ordering
  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        md={6}
        className={clsx(
          tutorial1 && clsx(classes.backdropTop, classes.disable)
        )}
      >
        <Card
          classes={{ root: classes.overflow }}
          className={clsx(tutorial === SDT.optionsLeft && classes.highlight)}
        >
          <CardContent>
            <SceneOptionCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        className={clsx(
          tutorial2 && clsx(classes.backdropTop, classes.disable)
        )}
      >
        <Card
          className={clsx(tutorial === SDT.optionsRight && classes.highlight)}
        >
          <CardContent>
            <ImageVideoCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

;(SceneOptions as any).displayName = 'SceneOptions'
export default withStyles(styles)(SceneOptions as any)
