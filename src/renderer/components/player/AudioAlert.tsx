import React, {
  type PropsWithChildren,
  useEffect,
  useRef,
  useState
} from 'react'
import { animated, useTransition } from 'react-spring'

import { type Theme, Typography } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'
import { grey } from '@mui/material/colors'

import type Audio from '../../../store/audio/Audio'

const styles = (theme: Theme) =>
  createStyles({
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
  })

interface AudioAlertLayerProps {
  visible: boolean
}

function AudioAlertLayer (props: PropsWithChildren<AudioAlertLayerProps>) {
  const fadeTransitions: [{ item: any, props: any, key: any }] = useTransition(
    props.visible,
    (visible: any) => visible,
    {
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
    }
  )

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

export interface AudioAlertProps extends WithStyles<typeof styles> {
  audio: Audio
}

function AudioAlert (props: AudioAlertProps) {
  const [visible, setVisible] = useState(false)

  const _timeout = useRef<number>()

  useEffect(() => {
    if (props.audio) {
      show()
    }

    return () => {
      clearTimeout(_timeout.current)
      _timeout.current = undefined
    }
  }, [])

  useEffect(() => {
    clearTimeout(_timeout.current)
    show()
  }, [props.audio])

  const show = () => {
    setVisible(true)
    _timeout.current = window.setTimeout(hide.bind(this), 6000)
  }

  const hide = () => {
    setVisible(false)
  }

  const classes = props.classes
  if (!props.audio) return <React.Fragment />

  return (
    <AudioAlertLayer visible={visible}>
      <div className={classes.alert}>
        <img className={classes.thumb} src={props.audio.thumb} />
        <div className={classes.infoContainer}>
          <div className={classes.infoBackdrop} />
          <Typography variant="h3" className={classes.info}>
            {props.audio.name ? props.audio.name : props.audio.url}
          </Typography>
          {props.audio.artist && (
            <Typography variant="h5" className={classes.info}>
              {props.audio.artist}
            </Typography>
          )}
          {props.audio.album && (
            <Typography variant="h6" className={classes.info}>
              {props.audio.album}
            </Typography>
          )}
        </div>
      </div>
    </AudioAlertLayer>
  )
}

;(AudioAlert as any).displayName = 'AudioAlert'
export default withStyles(styles)(AudioAlert as any)
