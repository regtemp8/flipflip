import { type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import Masonry from '@mui/lab/Masonry'

import ImageView from './ImageView'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setPlayerState } from '../../store/player/slice'
import { selectAppConfigDisplaySettingsMaxInHistory } from '../../store/app/selectors'
import { selectConstants } from '../../store/constants/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
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
}))

export interface PictureGridProps {
  pictures: Array<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement>
}

function PictureGrid(props: PictureGridProps) {
  const dispatch = useAppDispatch()
  const maxPictures = useAppSelector(
    selectAppConfigDisplaySettingsMaxInHistory()
  )
  const { masonryDefaultHeight, masonryDefaultColumns } =
    useAppSelector(selectConstants())

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

  const { classes } = useStyles()
  const pictures = Array.from(props.pictures).reverse()
  return (
    <div className={classes.content}>
      <div className={classes.masonry}>
        <Masonry
          columns={[1, 2, 3, 4]}
          spacing={1}
          defaultSpacing={1}
          defaultColumns={masonryDefaultColumns}
          defaultHeight={masonryDefaultHeight}
        >
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
export default PictureGrid
