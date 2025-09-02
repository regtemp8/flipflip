import { PropsWithChildren } from 'react'
import { cx } from '@emotion/css'
import Sortable from 'react-sortablejs'
import { IconButton, type Theme, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import { makeStyles } from 'tss-react/mui'
import { SG, SceneGroup } from 'flipflip-common'
import SceneCard from './SceneCard'
import PlaylistCard from './PlaylistCard'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      display: 'flex'
    },
    fill: {
      flexGrow: 1
    },
    sceneList: {
      padding: theme.spacing(1),
      display: 'flex',
      flexWrap: 'wrap'
    },
    titleInput: {
      color: theme.palette.text.primary,
      fontSize: theme.typography.h6.fontSize
    },
    groupTitle: {
      lineHeight: '45px',
      minWidth: '20px',
      color: theme.palette.text.primary
    },
    groupHandle: {
      margin: theme.spacing(1),
      cursor: 'move'
    }
  }
})

export interface SceneGroupCardProps {
  group: SceneGroup
  isEditingName: boolean

  beginEditingName: (groupID: number) => void
  endEditingName: () => void
}

function SceneGroupCard(props: PropsWithChildren<SceneGroupCardProps>) {
  const { group, isEditingName, beginEditingName } = props
  const { classes } = useStyles()

  return (
    <>
      <div className={classes.root}>
        <DragHandleIcon className={cx('group-handle', classes.groupHandle)} />
        {/* {isEditingName && (
          <form onSubmit={endEditingName} className={classes.groupTitle}>
            <BaseTextField
              variant="standard"
              autoFocus
              id="title"
              margin="none"
              selector={selectSceneGroupName(id)}
              action={setSceneGroupName(id)}
              onBlur={endEditingName}
              inputProps={{ className: classes.titleInput }}
            />
          </form>
        )} */}
        {!isEditingName && (
          <Typography
            variant={'h6'}
            onClick={() => {
              beginEditingName(group.id)
            }}
            className={classes.groupTitle}
          >
            {group.name}
          </Typography>
        )}
        <div className={classes.fill} />
        <IconButton
          color="inherit"
          aria-label="Delete"
          onClick={() => {
            // dispatch(removeSceneGroup(id))
          }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </div>
      <Sortable
        className={classes.sceneList}
        options={{
          group: {
            name: group.type,
            pull: true,
            put: true
          },
          animation: 150,
          easing: 'cubic-bezier(1, 0, 0, 1)'
        }}
        // onChange={(order: any, sortable: any, evt: any) => {
        //     dispatch(
        //       onScenePickerChangeSceneGroupItemsSort(
        //         id,
        //         items,
        //         evt.type,
        //         evt.oldIndex,
        //         evt.newIndex,
        //         Number(evt.item.id),
        //         order.length
        //       )
        //     )
        // }}
      >
        {group.type === SG.playlist
          ? group.items.map((item) => (
              <PlaylistCard
                playlistID={item.id}
                type={item.type as string}
                name={item.name}
                toDelete={false}
              />
            ))
          : group.items.map((item) => (
              <SceneCard
                sceneID={item.id}
                type={group.type}
                name={item.name}
                toDelete={false}
              />
            ))}
      </Sortable>
    </>
  )
}

;(SceneGroupCard as any).displayName = 'SceneGroupCard'
export default SceneGroupCard
