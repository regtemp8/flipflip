import { type Theme } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'
import Masonry from '@mui/lab/Masonry'

import ImageView from './ImageView'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setPlayerState } from '../../store/player/slice'
import { selectAppConfigDisplaySettingsMaxInHistory } from '../../store/app/selectors'

const styles = (theme: Theme) =>
  createStyles({
    content: {
      position: 'absolute',
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      zIndex: theme.zIndex.appBar - 1,
      backgroundColor: theme.palette.background.default
    },
    masonry: {
      overflowY: 'auto',
      overflowX: 'hidden',
      minHeight: 'calc(100% - ' + theme.mixins.toolbar.minHeight + 'px)'
    },
    image: {
      marginBottom: 0,
      '&:hover': {
        opacity: 0.7
      }
    }
  })

export interface PictureGridProps extends WithStyles<typeof styles> {
  pictures: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>
}

function PictureGrid(props: PictureGridProps) {
  const dispatch = useAppDispatch()
  const maxPictures = useAppSelector(
    selectAppConfigDisplaySettingsMaxInHistory()
  )

  useEffect(() => {
    for (let i = 0; i < maxPictures; i++) {
      dispatch(
        setPlayerState({
          uuid: 'picture-grid-img-' + i,
          value: {
            sceneID: -1, // TODO fix this
            nextSceneID: -1,
            overlays: [],
            firstImageLoaded: true,
            mainLoaded: true,
            isEmpty: false,
            hasStarted: true
          }
        })
      )
    }
  }, [maxPictures])

  const classes = props.classes
  const pictures = Array.from(props.pictures).reverse()
  return (
    <div className={classes.content}>
      <div className={classes.masonry}>
        <Masonry columns={[1, 2, 3, 4]} spacing={1}>
          {pictures.map((p, x) => (
            <ImageView
              key={x}
              className={classes.image}
              uuid={'picture-grid-img-' + x}
              image={p}
              fitParent
              removeChild
              pictureGrid
            />
          ))}
        </Masonry>
      </div>
    </div>
  )
}

;(PictureGrid as any).displayName = 'PictureGrid'
export default withStyles(styles)(PictureGrid as any)
