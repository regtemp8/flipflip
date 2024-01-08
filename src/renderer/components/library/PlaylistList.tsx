import React, { useState } from 'react'
import clsx from 'clsx'

import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  type Theme,
  Typography
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import { useAppSelector } from '../../../store/hooks'
import { selectAppPlaylistThumbs } from '../../../store/playlist/selectors'

const styles = (theme: Theme) =>
  createStyles({
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
  })

export interface PlaylistListProps extends WithStyles<typeof styles> {
  showHelp: boolean
  onClickPlaylist: (playlist: string) => void
}

function PlaylistList(props: PlaylistListProps) {
  const playlistThumbs = useAppSelector(selectAppPlaylistThumbs())
  const [hover, setHover] = useState<any>()

  const onMouseEnter = (album: string) => {
    setHover(album)
  }

  const onMouseLeave = () => {
    setHover(null)
  }

  const classes = props.classes
  if (Object.keys(playlistThumbs).length === 0) {
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
            Create playlists by clicking "Add to Playlist" in the sidebar
          </Typography>
        )}
      </React.Fragment>
    )
  }

  return (
    <Grid container spacing={2}>
      {Object.keys(playlistThumbs).map((p) => {
        const thumbs = playlistThumbs[p].map((thumb) =>
          thumb.replace(/\\/g, '/')
        )
        if (thumbs.length === 2) {
          thumbs.push('')
          thumbs.push('')
          thumbs[3] = thumbs[1]
          thumbs[1] = ''
        }
        return (
          <Grid
            key={p}
            item
            xs={6}
            sm={4}
            md={3}
            lg={2}
            className={classes.pointer}
            onClick={props.onClickPlaylist.bind(this, p)}
            onMouseEnter={onMouseEnter.bind(this, p)}
            onMouseLeave={onMouseLeave.bind(this)}
          >
            <Card classes={{ root: classes.root }}>
              <Grid container>
                {thumbs.map((t, index) => (
                  <Grid item xs={thumbs.length === 1 ? 12 : 6} key={index}>
                    {t && <CardMedia className={classes.media} image={t} />}
                  </Grid>
                ))}
                {thumbs.length === 0 && (
                  <Grid item xs={12}>
                    <AudiotrackIcon className={classes.mediaIcon} />
                  </Grid>
                )}
              </Grid>
              <CardContent classes={{ root: classes.cardContent }}>
                <Typography
                  className={clsx(hover === p && classes.underlineTitle)}
                  noWrap
                  variant="body1"
                >
                  {p}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}

;(PlaylistList as any).displayName = 'PlaylistList'
export default withStyles(styles)(PlaylistList as any)
