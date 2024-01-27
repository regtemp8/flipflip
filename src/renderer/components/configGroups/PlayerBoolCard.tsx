import { Collapse, Grid } from '@mui/material'

import BaseSwitch from '../common/BaseSwitch'
import {
  selectAppConfigDisplaySettingsAlwaysOnTop,
  selectAppConfigDisplaySettingsShowMenu,
  selectAppConfigDisplaySettingsFullScreen,
  selectAppConfigDisplaySettingsStartImmediately,
  selectAppConfigDisplaySettingsClickToProgress,
  selectAppConfigDisplaySettingsClickToProgressWhilePlaying,
  selectAppConfigDisplaySettingsEasingControls,
  selectAppConfigDisplaySettingsAudioAlert,
  selectAppConfigDisplaySettingsCloneGridVideoElements
} from '../../../store/app/selectors'
import {
  setConfigDisplaySettingsAlwaysOnTop,
  setConfigDisplaySettingsShowMenu,
  setConfigDisplaySettingsFullScreen,
  setConfigDisplaySettingsStartImmediately,
  setConfigDisplaySettingsClickToProgress,
  setConfigDisplaySettingsClickToProgressWhilePlaying,
  setConfigDisplaySettingsEasingControls,
  setConfigDisplaySettingsAudioAlert,
  setConfigDisplaySettingsCloneGridVideoElements
} from '../../../store/app/slice'
import { useAppSelector } from '../../../store/hooks'

export default function PlayerBoolCard() {
  const clickToProgress = useAppSelector(
    selectAppConfigDisplaySettingsClickToProgress()
  )

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
        <BaseSwitch
          label="Always On Top"
          selector={selectAppConfigDisplaySettingsAlwaysOnTop()}
          action={setConfigDisplaySettingsAlwaysOnTop}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Show Menu"
          selector={selectAppConfigDisplaySettingsShowMenu()}
          action={setConfigDisplaySettingsShowMenu}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Fullscreen"
          selector={selectAppConfigDisplaySettingsFullScreen()}
          action={setConfigDisplaySettingsFullScreen}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Start Immediately"
          tooltip="If enabled, the player will start as soon as first image loads. If disabled, the player will load the first set of images from all sources before starting."
          selector={selectAppConfigDisplaySettingsStartImmediately()}
          action={setConfigDisplaySettingsStartImmediately}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Click to Progress"
          tooltip="If enabled, clicking the currently playing image will advance to the next image."
          selector={selectAppConfigDisplaySettingsClickToProgress()}
          action={setConfigDisplaySettingsClickToProgress}
        />
      </Grid>
      <Grid
        item
        xs={12}
        style={clickToProgress ? { paddingLeft: 40 } : { padding: 0 }}
      >
        <Collapse in={clickToProgress}>
          <BaseSwitch
            label="While Playing"
            tooltip="If enabled, clicking will advance even during Scene playback. If disabled, clicking will only advance while Scene playback is paused."
            size="small"
            selector={selectAppConfigDisplaySettingsClickToProgressWhilePlaying()}
            action={setConfigDisplaySettingsClickToProgressWhilePlaying}
          />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Show Adv Easing Controls"
          tooltip="If enabled, additional controls for controlling 'easing' will be available in the Effect section."
          selector={selectAppConfigDisplaySettingsEasingControls()}
          action={setConfigDisplaySettingsEasingControls}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Show Audio Info"
          tooltip="If enabled, track information will appear during playback whenever a new audio track starts."
          selector={selectAppConfigDisplaySettingsAudioAlert()}
          action={setConfigDisplaySettingsAudioAlert}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Clone Grid Videos Directly"
          tooltip="If enabled, cloned/mirrored grid cells will use a copy of the actual video file, instead of a canvas. This may improve video framerate, but will remove absolute synchronization"
          selector={selectAppConfigDisplaySettingsCloneGridVideoElements()}
          action={setConfigDisplaySettingsCloneGridVideoElements}
        />
      </Grid>
    </Grid>
  )
}

;(PlayerBoolCard as any).displayName = 'PlayerBoolCard'
