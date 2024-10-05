/// <reference path="../../react-sortablejs.d.ts" />
import Sortable from 'react-sortablejs'
import { PropsWithChildren } from 'react'
import { type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    sceneList: {
      padding: theme.spacing(1),
      display: 'flex',
      flexWrap: 'wrap'
    }
  }
})

export interface UngroupedSortableProps {
  type: string
}

function UngroupedSortable(props: PropsWithChildren<UngroupedSortableProps>) {
  const { type, children } = props
  const { classes } = useStyles()
  return (
    <Sortable
      className={classes.sceneList}
      options={{
        group: {
          name: type,
          pull: true,
          put: true
        },
        animation: 150,
        easing: 'cubic-bezier(1, 0, 0, 1)'
      }}
      onChange={(order: any, sortable: any, evt: any) => {
        // dispatch(
        //   onScenePickerChangeUngroupedSort(
        //     ungrouped,
        //     type,
        //     evt.type,
        //     evt.oldIndex,
        //     evt.newIndex,
        //     Number(evt.item.id),
        //     order.length
        //   )
        // )
      }}
    >
      {children}
    </Sortable>
  )
}

;(UngroupedSortable as any).displayName = 'UngroupedSortable'
export default UngroupedSortable
