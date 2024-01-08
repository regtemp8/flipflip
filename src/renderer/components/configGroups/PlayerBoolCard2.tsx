import React, { type ChangeEvent, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid
} from '@mui/material'

import BaseSwitch from '../common/BaseSwitch'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectConstants } from '../../../store/constants/selectors'
import {
  setConfigGeneralSettingsPrioritizePerformance,
  setConfigGeneralSettingsConfirmSceneDeletion,
  setConfigGeneralSettingsConfirmBlacklist,
  setConfigGeneralSettingsConfirmFileDeletion,
  setConfigGeneralSettingsPortableMode,
  setConfigGeneralSettingsDisableLocalSave
} from '../../../store/app/slice'
import {
  selectAppConfigGeneralSettingsPrioritizePerformance,
  selectAppConfigGeneralSettingsConfirmSceneDeletion,
  selectAppConfigGeneralSettingsConfirmBlacklist,
  selectAppConfigGeneralSettingsConfirmFileDeletion,
  selectAppConfigGeneralSettingsPortableMode,
  selectAppConfigGeneralSettingsDisableLocalSave
} from '../../../store/app/selectors'
import { restoreAppStorageFromBackup } from '../../../store/app/thunks'

export default function PlayerBoolCard2() {
  const [portableDialog, setPortableDialog] = useState(false)

  const dispatch = useAppDispatch()
  const { portablePathExists, portablePath } = useAppSelector(selectConstants())
  const prioritizePerformance = useAppSelector(
    selectAppConfigGeneralSettingsPrioritizePerformance()
  )
  const portableMode = useAppSelector(
    selectAppConfigGeneralSettingsPortableMode()
  )

  const onTogglePortable = (
    e: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (checked && portablePathExists) {
      // Ask whether to keep local or keep portable
      onToggleDialog()
    } else {
      dispatch(setConfigGeneralSettingsPortableMode(checked))
    }
  }

  const onToggleDialog = () => {
    setPortableDialog(portableDialog)
  }

  const onChoosePortable = () => {
    dispatch(setConfigGeneralSettingsPortableMode(true))
    dispatch(restoreAppStorageFromBackup(portablePath))
    onToggleDialog()
  }

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
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
          selector={selectAppConfigGeneralSettingsPrioritizePerformance()}
          action={setConfigGeneralSettingsPrioritizePerformance}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Confirm Scene Deletion"
          tooltip="If disabled, no prompt will appear to confirm Scene deletion"
          selector={selectAppConfigGeneralSettingsConfirmSceneDeletion()}
          action={setConfigGeneralSettingsConfirmSceneDeletion}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Confirm Blacklist"
          tooltip="If disabled, no prompt will appear to confirm blacklisting a file"
          selector={selectAppConfigGeneralSettingsConfirmBlacklist()}
          action={setConfigGeneralSettingsConfirmBlacklist}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Confirm File Deletion"
          tooltip="If disabled, no prompt will appear to confirm File deletion"
          selector={selectAppConfigGeneralSettingsConfirmFileDeletion()}
          action={setConfigGeneralSettingsConfirmFileDeletion}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Portable Mode"
          tooltip="Portable Mode will save a copy of your data in the same directory as the FlipFlip executable, as well as the default save path. This needs to be enabled on each machine."
          selector={selectAppConfigGeneralSettingsPortableMode()}
          onChange={onTogglePortable}
        />
      </Grid>
      {portableMode && (
        <Grid item xs={12}>
          <BaseSwitch
            label="Disable Local Saves"
            tooltip="If on, data will only be saved in the same directory as the FlipFlip executable, and not at the default save path."
            selector={selectAppConfigGeneralSettingsDisableLocalSave()}
            action={setConfigGeneralSettingsDisableLocalSave}
          />
        </Grid>
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
    </Grid>
  )
}

;(PlayerBoolCard2 as any).displayName = 'PlayerBoolCard2'
