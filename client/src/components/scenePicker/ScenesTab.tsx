import { Box } from '@mui/material'
import { SG } from 'flipflip-common'
import {
  useGetSceneGroupsQuery,
  useGetUngroupedScenesQuery
} from '../../store/api'
import GroupedSortable from './GroupedSortable'
import UngroupedSortable from './UngroupedSortable'
import SceneCard from './SceneCard'
import SceneGroupCard from './SceneGroupCard'

function ScenesTab() {
  const grouped = useGetSceneGroupsQuery()
  const ungrouped = useGetUngroupedScenesQuery()
  return (
    <Box>
      {grouped.isSuccess && grouped.data.length > 0 && (
        <GroupedSortable>
          {grouped.data.map((group) => (
            <SceneGroupCard
              group={group}
              isEditingName={false}
              beginEditingName={() => {}}
              endEditingName={() => {}}
            />
          ))}
        </GroupedSortable>
      )}
      {ungrouped.isSuccess && ungrouped.data.length > 0 && (
        <UngroupedSortable type={SG.scene}>
          {ungrouped.data.map((item) => (
            <SceneCard sceneID={item.id} name={item.name} toDelete={false} />
          ))}
        </UngroupedSortable>
      )}
    </Box>
  )
}

;(ScenesTab as any).displayName = 'ScenesTab'
export default ScenesTab
