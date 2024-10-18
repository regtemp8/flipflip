import { Box } from '@mui/material'
import { SG } from 'flipflip-common'
import {
  useGetPlaylistGroupsQuery,
  useGetUngroupedPlaylistsQuery
} from '../../store/api/slice'
import GroupedSortable from './GroupedSortable'
import UngroupedSortable from './UngroupedSortable'
import SceneGroupCard from './SceneGroupCard'
import PlaylistCard from './PlaylistCard'

function PlaylistsTab() {
  const grouped = useGetPlaylistGroupsQuery()
  const ungrouped = useGetUngroupedPlaylistsQuery()
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
        <UngroupedSortable type={SG.playlist}>
          {ungrouped.data.map((item) => (
            <PlaylistCard
              playlistID={item.id}
              type={item.type as string}
              name={item.name}
              toDelete={false}
              action={() => {}}
            />
          ))}
        </UngroupedSortable>
      )}
    </Box>
  )
}

;(PlaylistsTab as any).displayName = 'PlaylistsTab'
export default PlaylistsTab
