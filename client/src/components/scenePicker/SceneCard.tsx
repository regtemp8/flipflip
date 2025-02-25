import { cx } from '@emotion/css'
import {
  Card,
  CardActionArea,
  CardContent,
  type Theme,
  Typography
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import Jiggle from '../animations/Jiggle'
import { Link as RouterLink } from 'react-router'
import { SG } from 'flipflip-common'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    scene: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    deleteScene: {
      backgroundColor: theme.palette.error.main
    }
  }
})

export interface SceneCardProps {
  sceneID: number
  name: string
  type: string
  toDelete: boolean
}

const routes = new Map<string, string>()
routes.set(SG.scene, '/scenes')
routes.set(SG.generator, '/generators')
routes.set(SG.display, '/displays')

function SceneCard(props: SceneCardProps) {
  const { type, sceneID, name, toDelete } = props
  const { classes } = useStyles()

  const route = routes.get(type)
  return (
    <Jiggle
      id={sceneID.toString()}
      bounce
      disable={toDelete}
      className={classes.scene}
    >
      <Card className={cx(toDelete && classes.deleteScene)}>
        <CardActionArea
          component={(props) => (
            <RouterLink {...props} to={`${route}/${sceneID}`} />
          )}
        >
          <CardContent>
            <Typography component="h2" variant="h6">
              {name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Jiggle>
  )
}

;(SceneCard as any).displayName = 'SceneCard'
export default SceneCard
