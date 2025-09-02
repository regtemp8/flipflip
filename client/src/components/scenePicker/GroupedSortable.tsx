/// <reference path="../../react-sortablejs.d.ts" />
import Sortable from 'react-sortablejs'
import { PropsWithChildren } from 'react'

function GroupedSortable(props: PropsWithChildren) {
  const { children } = props
  return (
    <Sortable
      options={{
        group: {
          name: 'group',
          pull: false,
          put: false
        },
        animation: 150,
        handle: '.group-handle',
        easing: 'cubic-bezier(1, 0, 0, 1)'
      }}
      // onChange={(order: any, sortable: any, evt: any) => {
      //   dispatch(
      //     onScenePickerChangeSceneGroupSort(type, evt.oldIndex, evt.newIndex)
      //   )
      // }}
    >
      {children}
    </Sortable>
  )
}

;(GroupedSortable as any).displayName = 'GroupedSortable'
export default GroupedSortable
