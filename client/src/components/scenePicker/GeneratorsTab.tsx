import {
  useGetGeneratorGroupsQuery,
  useGetUngroupedGeneratorsQuery
} from '../../store/api'
import GroupedSortable from './GroupedSortable'
import UngroupedSortable from './UngroupedSortable'
import SceneCard from './SceneCard'
import SceneGroupCard from './SceneGroupCard'
import { Box } from '@mui/material'
import { SG } from 'flipflip-common'

function GeneratorsTab() {
  const grouped = useGetGeneratorGroupsQuery()
  const ungrouped = useGetUngroupedGeneratorsQuery()
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
        <UngroupedSortable type={SG.generator}>
          {ungrouped.data.map((item) => (
            <SceneCard sceneID={item.id} name={item.name} toDelete={false} />
          ))}
        </UngroupedSortable>
      )}
    </Box>
  )
}

;(GeneratorsTab as any).displayName = 'GeneratorsTab'
export default GeneratorsTab
