import { useState } from 'react'
import { cx } from '@emotion/css'

import { Avatar, LinearProgress, type Theme, Typography } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import { useGetAudioArtistsQuery } from '../../store/api/slice'

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
  const { data: artists, isLoading } = useGetAudioArtistsQuery(props.sources)
  const [hover, setHover] = useState<string>()

  const onMouseEnter = (artist: string) => {
    setHover(artist)
  }

  const onMouseLeave = () => {
    setHover(undefined)
  }

  const { classes } = useStyles()
  if (isLoading) {
    return <LinearProgress />
  } else if (artists == null || artists.length === 0) {
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

  const width = window.innerWidth - 104 // 72px drawer + 2x18px padding
  const numIcons = Math.floor(width / 178) // 160xp width + 2x9px padding
  const remainingWidth = width - numIcons * 178
  const padding = Math.floor(remainingWidth / numIcons / 2) + 6
  return (
    <div className={classes.artistContainer}>
      {artists.map((artist) => {
        const { name, thumb } = artist
        return (
          <div
            key={name}
            className={classes.artist}
            style={{ padding }}
            onClick={() => props.onClickArtist(name)}
            onMouseEnter={() => onMouseEnter(name)}
            onMouseLeave={onMouseLeave}
          >
            <Avatar
              alt={name}
              src={thumb}
              className={cx(classes.large, hover === name && classes.shadow)}
            >
              {thumb == null && (
                <AudiotrackIcon className={classes.mediaIcon} />
              )}
            </Avatar>
            <Typography
              display={'block'}
              className={cx(
                classes.trackArtist,
                hover === name && classes.underlineTitle
              )}
              variant={'h6'}
            >
              {name}
            </Typography>
          </div>
        )
      })}
    </div>
  )
}

;(AudioArtistList as any).displayName = 'AudioArtistList'
export default AudioArtistList
