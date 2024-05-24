import { cx } from '@emotion/css'

import { Card, CardContent, Grid, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { SDT } from 'flipflip-common'
import ImageVideoCard from '../configGroups/ImageVideoCard'
import SceneOptionCard from '../configGroups/SceneOptionCard'
import { useAppSelector } from '../../store/hooks'
import { selectAppTutorial } from '../../store/app/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
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
}))

export interface SceneOptionsProps {
  sceneID?: number
}

function SceneOptions(props: SceneOptionsProps) {
  const tutorial = useAppSelector(selectAppTutorial())
  const { classes } = useStyles()
  const tutorial1 =
    tutorial === SDT.optionsLeft ||
    tutorial === SDT.timing ||
    tutorial === SDT.backForth ||
    tutorial === SDT.imageSizing ||
    tutorial === SDT.nextScene
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
        className={cx(tutorial1 && cx(classes.backdropTop, classes.disable))}
      >
        <Card
          classes={{ root: classes.overflow }}
          className={cx(tutorial === SDT.optionsLeft && classes.highlight)}
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
        className={cx(tutorial2 && cx(classes.backdropTop, classes.disable))}
      >
        <Card
          className={cx(tutorial === SDT.optionsRight && classes.highlight)}
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
export default SceneOptions
