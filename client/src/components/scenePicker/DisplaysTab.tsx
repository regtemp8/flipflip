import { Box } from '@mui/material'
import { SG } from 'flipflip-common'
import {
  useGetDisplayGroupsQuery,
  useGetUngroupedDisplaysQuery
} from '../../store/api/slice'
import GroupedSortable from './GroupedSortable'
import UngroupedSortable from './UngroupedSortable'
import SceneCard from './SceneCard'
import SceneGroupCard from './SceneGroupCard'

function DisplaysTab() {
  const grouped = useGetDisplayGroupsQuery()
  const ungrouped = useGetUngroupedDisplaysQuery()
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
        <UngroupedSortable type={SG.display}>
          {ungrouped.data.map((item) => (
            <SceneCard
              sceneID={item.id}
              type={SG.display}
              name={item.name}
              toDelete={false}
            />
          ))}
        </UngroupedSortable>
      )}
    </Box>
  )
}

;(DisplaysTab as any).displayName = 'DisplaysTab'
export default DisplaysTab
