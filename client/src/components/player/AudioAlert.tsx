import React, {
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
  CSSProperties,
  useCallback
} from 'react'
import {
  ForwardedProps,
  UseTransitionResult,
  animated,
  useTransition
} from 'react-spring'

import { type Theme, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'
import {
  selectAudioName,
  selectAudioThumb,
  selectAudioAlbum,
  selectAudioArtist,
  selectAudioUrl
} from '../../store/audio/selectors'
import { selectUndefined } from '../../store/app/selectors'
import { useAppSelector } from '../../store/hooks'

const useStyles = makeStyles()((theme: Theme) => ({
  alert: {
    float: 'left',
    margin: theme.spacing(5),
    display: 'flex'
  },
  thumb: {
    maxHeight: 250
  },
  infoContainer: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column-reverse'
  },
  infoBackdrop: {
    position: 'absolute',
    backgroundColor: grey[500],
    opacity: 0.5,
    filter: 'blur(5px)',
    width: '100%',
    height: '100%',
    zIndex: 8
  },
  info: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    zIndex: 9,
    '&:nth-child(2)': {
      paddingBottom: theme.spacing(4),
      textDecoration: 'underline'
    },
    '&:last-child': {
      paddingTop: theme.spacing(4)
    }
  }
}))

interface AudioAlertLayerProps {
  visible: boolean
}

function AudioAlertLayer(props: PropsWithChildren<AudioAlertLayerProps>) {
  const fadeTransitions: UseTransitionResult<
    boolean,
    ForwardedProps<CSSProperties>
  >[] = useTransition(props.visible, (visible: any) => visible, {
    from: {
      // Base values, optional
      opacity: 0
    },
    enter: {
      // Styles apply for entering elements
      opacity: 1
    },
    leave: {
      // Styles apply for leaving elements
      opacity: 0
    },
    config: {
      duration: 2000
    }
  })

  return (
    <React.Fragment>
      {fadeTransitions.map((transition) => {
        return (
          <animated.div
            key={transition.key}
            style={{
              zIndex: 10,
              position: 'absolute',
              bottom: 0,
              ...transition.props
            }}
          >
            {transition.item === true && props.children}
          </animated.div>
        )
      })}
    </React.Fragment>
  )
}

export interface AudioAlertProps {
  audioID?: number
}

function AudioAlert(props: AudioAlertProps) {
  const nameSelector =
    props.audioID != null ? selectAudioName(props.audioID) : selectUndefined
  const name = useAppSelector(nameSelector)
  const thumbSelector =
    props.audioID != null ? selectAudioThumb(props.audioID) : selectUndefined
  const thumb = useAppSelector(thumbSelector)
  const urlSelector =
    props.audioID != null ? selectAudioUrl(props.audioID) : selectUndefined
  const url = useAppSelector(urlSelector)
  const albumSelector =
    props.audioID != null ? selectAudioAlbum(props.audioID) : selectUndefined
  const album = useAppSelector(albumSelector)
  const artistSelector =
    props.audioID != null ? selectAudioArtist(props.audioID) : selectUndefined
  const artist = useAppSelector(artistSelector)

  const [visible, setVisible] = useState(false)
  const _timeout = useRef<number>()

  const show = useCallback(() => {
    setVisible(true)
    _timeout.current = window.setTimeout(hide, 6000)
  }, [])

  useEffect(() => {
    if (props.audioID != null) {
      show()
    }

    return () => {
      clearTimeout(_timeout.current)
      _timeout.current = undefined
    }
  }, [props.audioID, show])

  useEffect(() => {
    clearTimeout(_timeout.current)
    show()
  }, [props.audioID, show])

  const hide = () => {
    setVisible(false)
  }

  const { classes } = useStyles()
  if (props.audioID == null) return <React.Fragment />

  return (
    <AudioAlertLayer visible={visible}>
      <div className={classes.alert}>
        <img className={classes.thumb} src={thumb} alt={name} />
        <div className={classes.infoContainer}>
          <div className={classes.infoBackdrop} />
          <Typography variant="h3" className={classes.info}>
            {name ?? url}
          </Typography>
          {artist && (
            <Typography variant="h5" className={classes.info}>
              {artist}
            </Typography>
          )}
          {album && (
            <Typography variant="h6" className={classes.info}>
              {album}
            </Typography>
          )}
        </div>
      </div>
    </AudioAlertLayer>
  )
}

;(AudioAlert as any).displayName = 'AudioAlert'
export default AudioAlert
