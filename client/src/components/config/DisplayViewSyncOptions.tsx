import { Grid, MenuItem, Theme } from '@mui/material'
import BaseSelect from '../common/BaseSelect'
import {
  setDisplayViewMirrorSyncedView,
  setDisplayViewSyncWithView
} from '../../store/displayView/actions'
import {
  selectDisplayViewMirrorSyncedView,
  selectDisplayViewSyncWithView
} from '../../store/displayView/selectors'
import { MVF, en } from 'flipflip-common'
import { useAppSelector } from '../../store/hooks'
import { selectDisplayViewSyncOptions } from '../../store/display/selectors'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%'
  }
}))

export interface DisplayViewSyncOptionsProps {
  displayID: number
  viewID: number
}

function DisplayViewSyncOptions(props: DisplayViewSyncOptionsProps) {
  const viewSyncOptions = useAppSelector(
    selectDisplayViewSyncOptions(props.displayID)
  )

  const { classes } = useStyles()
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <BaseSelect
          label="Sync With"
          selector={selectDisplayViewSyncWithView(props.viewID)}
          action={setDisplayViewSyncWithView(props.viewID)}
          controlClassName={classes.fullWidth}
        >
          {Object.keys(viewSyncOptions).map((key: string) => {
            return (
              <MenuItem key={key} value={key}>
                {viewSyncOptions[key]}
              </MenuItem>
            )
          })}
        </BaseSelect>
      </Grid>
      <Grid item xs={12}>
        <BaseSelect
          label="Mirror"
          selector={selectDisplayViewMirrorSyncedView(props.viewID)}
          action={setDisplayViewMirrorSyncedView(props.viewID)}
          controlClassName={classes.fullWidth}
        >
          {Object.values(MVF).map((mvf: string) => {
            return (
              <MenuItem key={mvf} value={mvf}>
                {en.get(mvf)}
              </MenuItem>
            )
          })}
        </BaseSelect>
      </Grid>
    </Grid>
  )
}

;(DisplayViewSyncOptions as any).displayName = 'DisplayViewSyncOptions'
export default DisplayViewSyncOptions
