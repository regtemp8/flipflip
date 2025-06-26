import { Grid2 } from '@mui/material'

import BaseSwitch from '../common/BaseSwitch'
import {
  setConfigGeneralSettingsPrioritizePerformance,
  setConfigGeneralSettingsConfirmSceneDeletion,
  setConfigGeneralSettingsConfirmBlacklist,
  setConfigGeneralSettingsConfirmFileDeletion
} from '../../store/api/thunks'
import {
  useGetGeneralSettingsPrioritizePerformanceQuery,
  useGetGeneralSettingsConfirmSceneDeletionQuery,
  useGetGeneralSettingsConfirmBlacklistQuery,
  useGetGeneralSettingsConfirmFileDeletionQuery
} from '../../store/api/selectors'

export default function PlayerBoolCard2() {
  const { data: prioritizePerformance } =
    useGetGeneralSettingsPrioritizePerformanceQuery()
  return (
    <Grid2 container spacing={2} alignItems="center">
      <Grid2 size={12}>
        <BaseSwitch
          label={
            prioritizePerformance
              ? 'Prioritize Performance'
              : 'Prioritize Loading'
          }
          tooltip={
            <div>
              Prioritizing performance will smooth image effects, but may
              dramatically increase load times.
              <br />
              Prioritizing loading will decrease load times, but may result in
              jittery effects during playback
            </div>
          }
          selector={useGetGeneralSettingsPrioritizePerformanceQuery}
          action={setConfigGeneralSettingsPrioritizePerformance}
        />
      </Grid2>
      <Grid2 size={12}>
        <BaseSwitch
          label="Confirm Scene Deletion"
          tooltip="If disabled, no prompt will appear to confirm Scene deletion"
          selector={useGetGeneralSettingsConfirmSceneDeletionQuery}
          action={setConfigGeneralSettingsConfirmSceneDeletion}
        />
      </Grid2>
      <Grid2 size={12}>
        <BaseSwitch
          label="Confirm Blacklist"
          tooltip="If disabled, no prompt will appear to confirm blacklisting a file"
          selector={useGetGeneralSettingsConfirmBlacklistQuery}
          action={setConfigGeneralSettingsConfirmBlacklist}
        />
      </Grid2>
      <Grid2 size={12}>
        <BaseSwitch
          label="Confirm File Deletion"
          tooltip="If disabled, no prompt will appear to confirm File deletion"
          selector={useGetGeneralSettingsConfirmFileDeletionQuery}
          action={setConfigGeneralSettingsConfirmFileDeletion}
        />
      </Grid2>
    </Grid2>
  )
}

;(PlayerBoolCard2 as any).displayName = 'PlayerBoolCard2'
