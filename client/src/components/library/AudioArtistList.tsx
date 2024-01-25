import React, { useState } from 'react'
import { cx } from '@emotion/css'

import { Avatar, type Theme, Typography } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AudiotrackIcon from '@mui/icons-material/Audiotrack'

import { selectAudioArtists } from '../../store/audio/selectors'
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
    paddingTop: '56.25%' // 16:9
  },
  mediaIcon: {
    width: '100%',
    height: 'auto'
  },
  underlineTitle: {
    textDecoration: 'underline'
  },
  shadow: {
    boxShadow: theme.shadows[10]
  },
  artistContainer: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  artist: {
    paddingTop: 0,
    textAlign: 'center',
    cursor: 'pointer'
  },
  trackArtist: {
    maxWidth: theme.spacing(20)
  },
  large: {
    width: theme.spacing(20),
    height: theme.spacing(20),
    borderStyle: 'double',
    borderColor: theme.palette.text.primary,
    borderWidth: 2
  }
}))

export interface AudioArtistListProps {
  sources: number[]
  showHelp: boolean
  onClickArtist: (artist: string) => void
}

function AudioArtistList(props: AudioArtistListProps) {
  const artists = useAppSelector(selectAudioArtists(props.sources))
  const [hover, setHover] = useState<string>()

  const onMouseEnter = (artist: string) => {
    setHover(artist)
  }

  const onMouseLeave = () => {
    setHover(undefined)
  }

  const { classes } = useStyles()
  if (artists.size === 0) {
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

  const artistKeys = Array.from(artists.keys())
  const width = window.innerWidth - 104 // 72px drawer + 2x18px padding
  const numIcons = Math.floor(width / 178) // 160xp width + 2x9px padding
  const remainingWidth = width - numIcons * 178
  const padding = Math.floor(remainingWidth / numIcons / 2) + 6
  return (
    <div className={classes.artistContainer}>
      {artistKeys.map((a) => {
        let thumb: string | undefined = artists.get(a)
        if (thumb) thumb = thumb.replace(/\\/g, '/')
        return (
          <div
            key={a}
            className={classes.artist}
            style={{ padding }}
            onClick={() => props.onClickArtist(a)}
            onMouseEnter={() => onMouseEnter(a)}
            onMouseLeave={onMouseLeave}
          >
            <Avatar
              alt={a}
              src={thumb}
              className={cx(classes.large, hover === a && classes.shadow)}
            >
              {thumb == null && (
                <AudiotrackIcon className={classes.mediaIcon} />
              )}
            </Avatar>
            <Typography
              display={'block'}
              className={cx(
                classes.trackArtist,
                hover === a && classes.underlineTitle
              )}
              variant={'h6'}
            >
              {a}
            </Typography>
          </div>
        )
      })}
    </div>
  )
}

;(AudioArtistList as any).displayName = 'AudioArtistList'
export default AudioArtistList
