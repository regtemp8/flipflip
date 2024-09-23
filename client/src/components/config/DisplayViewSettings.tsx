import { Collapse, Grid, InputAdornment, type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import {
  setDisplayViewHeight,
  setDisplayViewX,
  setDisplayViewY,
  setDisplayViewWidth,
  setDisplayViewOpacity,
  setDisplayViewZ,
  setDisplayViewSync,
  setDisplayViewScenePlaylistID
} from '../../store/displayView/actions'
import {
  selectDisplayViewHeight,
  selectDisplayViewOpacity,
  selectDisplayViewSync,
  selectDisplayViewWidth,
  selectDisplayViewX,
  selectDisplayViewY,
  selectDisplayViewZ,
  selectDisplayViewScenePlaylistID
} from '../../store/displayView/selectors'
import BaseSlider from '../common/slider/BaseSlider'
import BaseSwitch from '../common/BaseSwitch'
import { useAppSelector } from '../../store/hooks'
import DisplayViewSyncOptions from './DisplayViewSyncOptions'
import { PLT } from 'flipflip-common'
import { createScenePlaylist } from '../../store/displayView/thunks'
import PlaylistSelect from '../common/PlaylistSelect'

const useStyles = makeStyles()((theme: Theme) => ({
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0
  },
  fullWidth: {
    width: '100%'
  }
}))

export interface DisplayViewSettingsProps {
  displayID: number
  viewID: number
}

function DisplayViewSettings(props: DisplayViewSettingsProps) {
  const { displayID, viewID } = props
  const { classes } = useStyles()
  const xSelector = selectDisplayViewX(viewID)
  const ySelector = selectDisplayViewY(viewID)
  const zSelector = selectDisplayViewZ(viewID)
  const widthSelector = selectDisplayViewWidth(viewID)
  const heightSelector = selectDisplayViewHeight(viewID)
  const opacitySelector = selectDisplayViewOpacity(viewID)
  const syncSelector = selectDisplayViewSync(viewID)
  const xAction = setDisplayViewX(viewID)
  const yAction = setDisplayViewY(viewID)
  const zAction = setDisplayViewZ(viewID)
  const widthAction = setDisplayViewWidth(viewID)
  const heightAction = setDisplayViewHeight(viewID)
  const opacityAction = setDisplayViewOpacity(viewID)
  const syncAction = setDisplayViewSync(viewID)

  const sync = useAppSelector(syncSelector)
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <BaseSwitch
          label="Sync"
          tooltip="Synchronize this view with another view"
          selector={syncSelector}
          action={syncAction}
        />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={sync}>
          <DisplayViewSyncOptions displayID={displayID} viewID={viewID} />
        </Collapse>
        <Collapse in={!sync}>
          <PlaylistSelect
            type={PLT.scene}
            includeSingles
            selector={selectDisplayViewScenePlaylistID(viewID)}
            action={setDisplayViewScenePlaylistID(viewID)}
            create={createScenePlaylist(viewID)}
          />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <BaseSlider
          selector={xSelector}
          action={xAction}
          min={0}
          max={100}
          labelledBy="display-view-x-slider"
          format={{ type: 'percent' }}
          label={{
            text: 'X:',
            variant: 'body1',
            color: 'text.primary',
            appendValue: true
          }}
          textField={{
            className: classes.endInput,
            step: 5
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSlider
          selector={ySelector}
          action={yAction}
          min={0}
          max={100}
          labelledBy="display-view-y-slider"
          format={{ type: 'percent' }}
          label={{
            text: 'Y:',
            variant: 'body1',
            color: 'text.primary',
            appendValue: true
          }}
          textField={{
            className: classes.endInput,
            step: 5
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSlider
          selector={zSelector}
          action={zAction}
          min={0}
          max={10}
          labelledBy="display-view-z-slider"
          label={{
            text: 'Z:',
            variant: 'body1',
            color: 'text.primary',
            appendValue: true
          }}
          textField={{
            className: classes.endInput,
            step: 1,
            InputProps: {
              endAdornment: (
                <InputAdornment
                  position="end"
                  disableTypography
                  sx={{ color: 'transparent' }}
                >
                  %
                </InputAdornment>
              )
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSlider
          selector={widthSelector}
          action={widthAction}
          min={0}
          max={100}
          labelledBy="display-view-width-slider"
          format={{ type: 'percent' }}
          label={{
            text: 'Width:',
            variant: 'body1',
            color: 'text.primary',
            appendValue: true
          }}
          textField={{
            className: classes.endInput,
            step: 5
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSlider
          selector={heightSelector}
          action={heightAction}
          min={0}
          max={100}
          labelledBy="display-view-height-slider"
          format={{ type: 'percent' }}
          label={{
            text: 'Height:',
            variant: 'body1',
            color: 'text.primary',
            appendValue: true
          }}
          textField={{
            className: classes.endInput,
            step: 5
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSlider
          selector={opacitySelector}
          action={opacityAction}
          min={0}
          max={100}
          labelledBy="display-view-opacity-slider"
          format={{ type: 'percent' }}
          label={{
            text: 'Opacity:',
            variant: 'body1',
            color: 'text.primary',
            appendValue: true
          }}
          textField={{
            className: classes.endInput,
            step: 5
          }}
        />
      </Grid>
    </Grid>
  )
}

;(DisplayViewSettings as any).displayName = 'DisplayViewSettings'
export default DisplayViewSettings
