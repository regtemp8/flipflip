import { Grid2, MenuItem } from '@mui/material'
import BaseSelect from '../common/BaseSelect'
import {
  setDisplayViewMirrorSyncedView,
  setDisplayViewSyncWithView
} from '../../store/api/thunks'
import {
  useGetDisplayViewMirrorSyncedViewQuery,
  useGetDisplayViewSyncWithViewQuery
} from '../../store/api/selectors'
import { MVF, en } from 'flipflip-common'
import { makeStyles } from 'tss-react/mui'
import { useGetDisplayViewSyncOptionsQuery } from '../../store/api/slice'

const useStyles = makeStyles()(() => ({
  fullWidth: {
    width: '100%'
  }
}))

export interface DisplayViewSyncOptionsProps {
  displayID: number
  viewID: number
}

function DisplayViewSyncOptions(props: DisplayViewSyncOptionsProps) {
  const { data } = useGetDisplayViewSyncOptionsQuery(props.displayID)

  const viewSyncOptions: Record<string, string> = data ?? {}
  const { classes } = useStyles()
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={12}>
        <BaseSelect
          id="display-sync-with-select"
          label="Sync With"
          selector={() => useGetDisplayViewSyncWithViewQuery(props.viewID)}
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
      </Grid2>
      <Grid2 size={12}>
        <BaseSelect
          id="display-mirror-select"
          label="Mirror"
          selector={() => useGetDisplayViewMirrorSyncedViewQuery(props.viewID)}
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
      </Grid2>
    </Grid2>
  )
}

;(DisplayViewSyncOptions as any).displayName = 'DisplayViewSyncOptions'
export default DisplayViewSyncOptions
