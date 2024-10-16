import React, { type ChangeEvent, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid2
} from '@mui/material'

import BaseSwitch from '../common/BaseSwitch'
import {
  setConfigGeneralSettingsPrioritizePerformance,
  setConfigGeneralSettingsConfirmSceneDeletion,
  setConfigGeneralSettingsConfirmBlacklist,
  setConfigGeneralSettingsConfirmFileDeletion,
  setConfigGeneralSettingsDisableLocalSave
} from '../../store/api/thunks'
import {
  useGetGeneralSettingsPrioritizePerformanceQuery,
  useGetGeneralSettingsConfirmSceneDeletionQuery,
  useGetGeneralSettingsConfirmBlacklistQuery,
  useGetGeneralSettingsConfirmFileDeletionQuery,
  useGetGeneralSettingsPortableModeQuery,
  useGetGeneralSettingsDisableLocalSaveQuery
} from '../../store/api/selectors'

export default function PlayerBoolCard2() {
  const [portableDialog, setPortableDialog] = useState(false)

  const { data: prioritizePerformance } =
    useGetGeneralSettingsPrioritizePerformanceQuery()
  const { data: portableMode } = useGetGeneralSettingsPortableModeQuery()

  const onTogglePortable = (
    e: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    // TODO make portable mode work
    // if (checked && portablePathExists) {
    //   // Ask whether to keep local or keep portable
    //   onToggleDialog()
    // } else {
    //   dispatch(setConfigGeneralSettingsPortableMode(checked))
    // }
  }

  const onToggleDialog = () => {
    setPortableDialog(portableDialog)
  }

  const onChoosePortable = () => {
    // TODO make portable mode work
    // dispatch(setConfigGeneralSettingsPortableMode(true))
    // dispatch(restoreAppStorageFromBackup(portablePath))
    // onToggleDialog()
  }

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
      <Grid2 size={12}>
        <BaseSwitch
          label="Portable Mode"
          tooltip="Portable Mode will save a copy of your data in the same directory as the FlipFlip executable, as well as the default save path. This needs to be enabled on each machine."
          selector={useGetGeneralSettingsPortableModeQuery}
          onChange={onTogglePortable}
        />
      </Grid2>
      {portableMode && (
        <Grid2 size={12}>
          <BaseSwitch
            label="Disable Local Saves"
            tooltip="If on, data will only be saved in the same directory as the FlipFlip executable, and not at the default save path."
            selector={useGetGeneralSettingsDisableLocalSaveQuery}
            action={setConfigGeneralSettingsDisableLocalSave}
          />
        </Grid2>
      )}
      <Dialog
        open={portableDialog}
        onClose={onToggleDialog}
        aria-describedby="portable-description"
      >
        <DialogContent>
          <DialogContentText id="portable-description">
            Do you want to use the local data on this machine or existing
            portable data?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onToggleDialog} color="secondary">
            Local data
          </Button>
          <Button onClick={onChoosePortable} color="primary">
            Portable data
          </Button>
        </DialogActions>
      </Dialog>
    </Grid2>
  )
}

;(PlayerBoolCard2 as any).displayName = 'PlayerBoolCard2'
