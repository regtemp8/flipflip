import { useState, MouseEvent } from 'react'
import { cx } from '@emotion/css'

import {
  Card,
  CardContent,
  CardMedia,
  Grid2,
  LinearProgress,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import { makeStyles } from 'tss-react/mui'
import { useGetAudioAlbumsQuery } from '../../store/api/slice'

const useStyles = makeStyles()((theme: Theme) => ({
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%'
  },
  emptyMessage2: {
    textAlign: 'center'
  },
  media: {
    height: 0,
    paddingTop: '100%' // 16:9  = 56.25%
  },
  mediaIcon: {
    width: '100%',
    height: 'auto'
  },
  underlineTitle: {
    textDecoration: 'underline'
  },
  pointer: {
    cursor: 'pointer'
  },
  root: {
    borderRadius: 1
  },
  cardContent: {
    '&:last-child': {
      paddingBottom: theme.spacing(2)
    }
  },
  artist: {
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}))

export interface AudioAlbumListProps {
  sources: number[]
  showHelp: boolean
  onClickAlbum: (album: string) => void
  onClickArtist: (artist: string) => void
}

function AudioAlbumList(props: AudioAlbumListProps) {
  const { data: albums, isLoading } = useGetAudioAlbumsQuery(props.sources)
  const [hover, setHover] = useState<string>()

  const onMouseEnter = (album: string) => {
    setHover(album)
  }

  const onMouseLeave = () => {
    setHover(undefined)
  }

  const onClickArtist = (e: MouseEvent, artist: string) => {
    e.stopPropagation()
    props.onClickArtist(artist)
  }

  const { classes } = useStyles()
  if (isLoading) {
    return <LinearProgress />
  } else if (albums == null || albums.length === 0) {
    return (
      <>
        <Typography
          component="h1"
          variant="h3"
          color="inherit"
          noWrap
          className={classes.emptyMessage}
        >
          乁( ◔ ౪◔)「
        </Typography>
        <Typography
          component="h1"
          variant="h4"
          color="inherit"
          noWrap
          className={classes.emptyMessage2}
        >
          Nothing here
        </Typography>
        {props.showHelp && (
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.emptyMessage2}
          >
            Add tracks by going to the "Songs" tab and clicking the +
          </Typography>
        )}
      </>
    )
  }

  return (
    <Grid2 container spacing={2}>
      {albums.map((album) => {
        const { name, artist, isSingleArtist, thumb, count } = album
        return (
          <Grid2
            key={name}
            size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
            className={classes.pointer}
            onClick={() => {
              props.onClickAlbum(name)
            }}
            onMouseEnter={() => onMouseEnter(name)}
            onMouseLeave={onMouseLeave}
          >
            <Card classes={{ root: classes.root }}>
              {thumb && (
                <CardMedia
                  className={classes.media}
                  image={thumb}
                  title={name}
                />
              )}
              {!thumb && <AudiotrackIcon className={classes.mediaIcon} />}
              <CardContent classes={{ root: classes.cardContent }}>
                <Tooltip disableInteractive title={name} enterDelay={800}>
                  <Typography
                    className={cx(hover === name && classes.underlineTitle)}
                    noWrap
                    variant="body1"
                  >
                    {name}
                  </Typography>
                </Tooltip>
                <Typography
                  id={'artist-link'}
                  noWrap
                  onClick={
                    isSingleArtist ? (e) => onClickArtist(e, artist) : undefined
                  }
                  className={cx(isSingleArtist && classes.artist)}
                  color="textSecondary"
                  variant="body2"
                >
                  {artist}
                </Typography>
                <Typography noWrap color="textSecondary" variant="body2">
                  {count} {count === 1 ? 'song' : 'songs'}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        )
      })}
    </Grid2>
  )
}

;(AudioAlbumList as any).displayName = 'AudioAlbumList'
export default AudioAlbumList
