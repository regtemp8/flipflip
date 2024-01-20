import React, { useEffect, useState } from 'react'
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

import { makeStyles } from 'tss-react/mui'

import AudiotrackIcon from '@mui/icons-material/Audiotrack'

import type Audio from '../../store/audio/Audio'

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
  sources: Audio[]
  showHelp: boolean
  onClickAlbum: (album: string) => void
  onClickArtist: (artist: string) => void
}

function AudioAlbumList(props: AudioAlbumListProps) {
  const [albums, setAlbums] = useState<
    Map<string, { artist: string; thumb?: string; count: number }>
  >(new Map())
  const [hover, setHover] = useState<string>()

  useEffect(() => {
    setAlbums(getAlbums(props.sources))
  }, [props.sources])

  const nop = () => {}

  const onMouseEnter = (album: string) => {
    setHover(album)
  }

  const onMouseLeave = () => {
    setHover(undefined)
  }

  const getAlbums = (
    sources: Audio[]
  ): Map<string, { artist: string; thumb?: string; count: number }> => {
    const va = 'Various Artists'
    const albumMap = new Map<
      string,
      { artist: string; thumb?: string; count: number }
    >()
    const songs = Array.from(sources).sort((a, b) => {
      const albumA = a.album as string
      const albumB = b.album as string
      if (albumA > albumB) {
        return 1
      } else if (albumA < albumB) {
        return -1
      } else {
        const trackNumA = a.trackNum as number
        const trackNumB = b.trackNum as number
        if (trackNumA > trackNumB) {
          return 1
        } else if (trackNumA < trackNumB) {
          return -1
        } else {
          const nameA = a.name as string
          const nameB = b.name as string
          const reA = /^(A\s|a\s|The\s|the\s)/g
          const valueA = nameA.replace(reA, '')
          const valueB = nameB.replace(reA, '')
          return valueA.localeCompare(valueB, 'en', { numeric: true })
        }
      }
    })
    for (const song of songs) {
      if (
        song.album &&
        (!albumMap.has(song.album) ||
          !albumMap.get(song.album)?.thumb ||
          (albumMap.get(song.album)?.artist !== song.artist &&
            albumMap.get(song.album)?.artist !== va))
      ) {
        if (
          albumMap.has(song.album) &&
          albumMap.get(song.album)?.artist !== song.artist
        ) {
          albumMap.set(song.album, { artist: va, thumb: song.thumb, count: 0 })
        } else {
          albumMap.set(song.album, {
            artist: song.artist as string,
            thumb: song.thumb,
            count: 0
          })
        }
      }
    }
    for (const song of songs) {
      if (song.album) {
        const album = albumMap.get(song.album)
        albumMap.set(song.album, {
          artist: album?.artist as string,
          thumb: album?.thumb,
          count: (album?.count as number) + 1
        })
      }
    }
    return albumMap
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
