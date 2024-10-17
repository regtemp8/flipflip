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
import { Link } from 'react-router-dom'

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
  toDelete: boolean
}

function SceneCard(props: SceneCardProps) {
  const { sceneID, name, toDelete } = props
  const { classes } = useStyles()

  return (
    <Jiggle
      id={sceneID.toString()}
      bounce
      disable={toDelete}
      className={classes.scene}
    >
      <Card className={cx(toDelete && classes.deleteScene)}>
        <CardActionArea
          component={(props) => <Link to={`scenes/${sceneID}`} {...props} />}
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
