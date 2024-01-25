import React, { useState } from 'react'
import { cx } from '@emotion/css'

import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import { makeStyles } from 'tss-react/mui'
import { selectAudioAlbums } from '../../store/audio/selectors'
import { useAppSelector } from '../../store/hooks'

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
  const albums = useAppSelector(selectAudioAlbums(props.sources))
  const [hover, setHover] = useState<string>()

  const onMouseEnter = (album: string) => {
    setHover(album)
  }

  const onMouseLeave = () => {
    setHover(undefined)
  }

  const { classes } = useStyles()
  if (albums.size === 0) {
    return (
      <React.Fragment>
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
      </React.Fragment>
    )
  }

  const va = 'Various Artists'
  const albumsArray = Array.from(albums.entries())
  return (
    <Grid container spacing={2}>
      {albumsArray.map(([a, data]) => {
        let thumb: string | undefined = data.thumb
        if (thumb) thumb = thumb.replace(/\\/g, '/')
        const artist = data.artist
        const count = data.count
        return (
          <Grid
            key={a}
            item
            xs={6}
            sm={4}
            md={3}
            lg={2}
            className={classes.pointer}
            onClick={() => props.onClickAlbum(a)}
            onMouseEnter={() => onMouseEnter(a)}
            onMouseLeave={onMouseLeave}
          >
            <Card classes={{ root: classes.root }}>
              {thumb && (
                <CardMedia className={classes.media} image={thumb} title={a} />
              )}
              {!thumb && <AudiotrackIcon className={classes.mediaIcon} />}
              <CardContent classes={{ root: classes.cardContent }}>
                <Tooltip disableInteractive title={a} enterDelay={800}>
                  <Typography
                    className={cx(hover === a && classes.underlineTitle)}
                    noWrap
                    variant="body1"
                  >
                    {a}
                  </Typography>
                </Tooltip>
                <Typography
                  id={'artist-link'}
                  noWrap
                  onClick={() => {
                    if (artist !== va) {
                      props.onClickArtist(artist)
                    }
                  }}
                  className={cx(artist !== va && classes.artist)}
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
          </Grid>
        )
      })}
    </Grid>
  )
}

;(AudioAlbumList as any).displayName = 'AudioAlbumList'
export default AudioAlbumList
