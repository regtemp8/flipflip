import { Collapse, Grid2 } from '@mui/material'

import BaseSwitch from '../common/BaseSwitch'
import {
  useGetDisplaySettingsFullScreenQuery,
  useGetDisplaySettingsStartImmediatelyQuery,
  useGetDisplaySettingsClickToProgressQuery,
  useGetDisplaySettingsClickToProgressWhilePlayingQuery,
  useGetDisplaySettingsEasingControlsQuery,
  useGetDisplaySettingsAudioAlertQuery
} from '../../store/api/selectors'
import {
  setConfigDisplaySettingsFullScreen,
  setConfigDisplaySettingsStartImmediately,
  setConfigDisplaySettingsClickToProgress,
  setConfigDisplaySettingsClickToProgressWhilePlaying,
  setConfigDisplaySettingsEasingControls,
  setConfigDisplaySettingsAudioAlert
} from '../../store/api/thunks'

export default function PlayerBoolCard() {
  const { data: clickToProgress } = useGetDisplaySettingsClickToProgressQuery()

  return (
    <Grid2 container spacing={2} alignItems="center">
      <Grid2 size={12}>
        <BaseSwitch
          label="Fullscreen"
          selector={useGetDisplaySettingsFullScreenQuery}
          action={setConfigDisplaySettingsFullScreen}
        />
      </Grid2>
      <Grid2 size={12}>
        <BaseSwitch
          label="Start Immediately"
          tooltip="If enabled, the player will start as soon as first image loads. If disabled, the player will load the first set of images from all sources before starting."
          selector={useGetDisplaySettingsStartImmediatelyQuery}
          action={setConfigDisplaySettingsStartImmediately}
        />
      </Grid2>
      <Grid2 size={12}>
        <BaseSwitch
          label="Click to Progress"
          tooltip="If enabled, clicking the currently playing image will advance to the next image."
          selector={useGetDisplaySettingsClickToProgressQuery}
          action={setConfigDisplaySettingsClickToProgress}
        />
      </Grid2>
      <Grid2
        size={12}
        style={clickToProgress ? { paddingLeft: 40 } : { padding: 0 }}
      >
        <Collapse in={clickToProgress}>
          <BaseSwitch
            label="While Playing"
            tooltip="If enabled, clicking will advance even during Scene playback. If disabled, clicking will only advance while Scene playback is paused."
            size="small"
            selector={useGetDisplaySettingsClickToProgressWhilePlayingQuery}
            action={setConfigDisplaySettingsClickToProgressWhilePlaying}
          />
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <BaseSwitch
          label="Show Adv Easing Controls"
          tooltip="If enabled, additional controls for controlling 'easing' will be available in the Effect section."
          selector={useGetDisplaySettingsEasingControlsQuery}
          action={setConfigDisplaySettingsEasingControls}
        />
      </Grid2>
      <Grid2 size={12}>
        <BaseSwitch
          label="Show Audio Info"
          tooltip="If enabled, track information will appear during playback whenever a new audio track starts."
          selector={useGetDisplaySettingsAudioAlertQuery}
          action={setConfigDisplaySettingsAudioAlert}
        />
      </Grid2>
    </Grid2>
  )
}

;(PlayerBoolCard as any).displayName = 'PlayerBoolCard'
