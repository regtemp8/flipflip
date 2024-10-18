import { cx } from '@emotion/css'
import { makeStyles } from 'tss-react/mui'
import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Theme,
  Typography
} from '@mui/material'
import TvIcon from '@mui/icons-material/Tv'
import MovieIcon from '@mui/icons-material/Movie'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import DescriptionIcon from '@mui/icons-material/Description'
import { PLT } from 'flipflip-common'
import Jiggle from '../animations/Jiggle'
import { Link as RouterLink } from 'react-router-dom'

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

export interface PlaylistCardProps {
  playlistID: number
  name: string
  type: string
  toDelete: boolean
}

function PlaylistCard(props: PlaylistCardProps) {
  const { playlistID, name, type, toDelete } = props
  const { classes } = useStyles()

  return (
    <Jiggle
      id={playlistID.toString()}
      bounce
      disable={toDelete}
      className={classes.scene}
    >
      <Card className={cx(toDelete && classes.deleteScene)}>
      <CardActionArea
          component={(props) => <RouterLink {...props} to={`/playlists/${playlistID}`}/>}
        >          
        <CardContent>
            <Stack alignItems="center" direction="row" gap={2}>
              {type === PLT.audio && <AudiotrackIcon />}
              {type === PLT.display && <TvIcon />}
              {type === PLT.scene && <MovieIcon />}
              {type === PLT.script && <DescriptionIcon />}
              <Typography component="h2" variant="h6">
                {name}
              </Typography>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </Jiggle>
  )
}

;(PlaylistCard as any).displayName = 'PlaylistCard'
export default PlaylistCard
