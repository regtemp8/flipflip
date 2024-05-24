import {
  Grid,
  InputAdornment,
  type Theme,
  Tooltip,
  Typography
} from '@mui/material'

import LibrarySearch from '../library/LibrarySearch'

import { makeStyles } from 'tss-react/mui'
import BaseTextField from '../common/text/BaseTextField'
import {
  setConfigDisplaySettingsIgnoredTags,
  setConfigDisplaySettingsMinImageSize,
  setConfigDisplaySettingsMinVideoSize,
  setConfigDisplaySettingsMaxInHistory,
  setConfigDisplaySettingsMaxInMemory,
  setConfigDisplaySettingsMaxLoadingAtOnce
} from '../../store/app/slice'
import {
  selectAppConfigDisplaySettingsIgnoredTags,
  selectAppConfigDisplaySettingsMinImageSize,
  selectAppConfigDisplaySettingsMinVideoSize,
  selectAppConfigDisplaySettingsMaxInHistory,
  selectAppConfigDisplaySettingsMaxInMemory,
  selectAppConfigDisplaySettingsMaxLoadingAtOnce,
  selectAppLibrary
} from '../../store/app/selectors'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const useStyles = makeStyles()((theme: Theme) => ({
  grey: {
    color: theme.palette.text.secondary
  }
}))

function PlayerNumCard() {
  const dispatch = useAppDispatch()
  const library = useAppSelector(selectAppLibrary())
  const ignoredTags = useAppSelector(
    selectAppConfigDisplaySettingsIgnoredTags()
  )

  const onSelectTags = (selectedTags: string[]) => {
    dispatch(setConfigDisplaySettingsIgnoredTags(selectedTags))
  }

  const { classes } = useStyles()
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
        <BaseTextField
          variant="standard"
          label="Min Image Size"
          margin="dense"
          tooltip="Images under this size (width or height) will be skipped"
          selector={selectAppConfigDisplaySettingsMinImageSize()}
          action={setConfigDisplaySettingsMinImageSize}
          InputProps={{
            endAdornment: <InputAdornment position="end">px</InputAdornment>
          }}
          inputProps={{
            min: 0,
            type: 'number'
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseTextField
          variant="standard"
          label="Min Video Size"
          margin="dense"
          tooltip="Videos under this size (width or height) will be skipped"
          selector={selectAppConfigDisplaySettingsMinVideoSize()}
          action={setConfigDisplaySettingsMinVideoSize}
          InputProps={{
            endAdornment: <InputAdornment position="end">px</InputAdornment>
          }}
          inputProps={{
            min: 0,
            type: 'number'
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseTextField
          variant="standard"
          label="Max in History"
          margin="dense"
          tooltip="The maximum number of images/videos to keep in player history. Reduce this number to reduce memory usage and improve performance."
          selector={selectAppConfigDisplaySettingsMaxInHistory()}
          action={setConfigDisplaySettingsMaxInHistory}
          inputProps={{
            min: 0,
            type: 'number'
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseTextField
          variant="standard"
          label="Max in Memory"
          margin="dense"
          tooltip="The maximum number of images/videos to queue up for rendering. Reduce this number to reduce memory usage and improve performance."
          selector={selectAppConfigDisplaySettingsMaxInMemory()}
          action={setConfigDisplaySettingsMaxInMemory}
          inputProps={{
            min: 0,
            type: 'number'
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseTextField
          variant="standard"
          label="Max Loading at Once"
          margin="dense"
          tooltip="The maximum number of simultaneous images/videos loading. Increase this number to load sources faster. Reduce this number to improve display performance."
          selector={selectAppConfigDisplaySettingsMaxLoadingAtOnce()}
          action={setConfigDisplaySettingsMaxLoadingAtOnce}
          inputProps={{
            min: 0,
            type: 'number'
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Tooltip
          disableInteractive
          placement={'top'}
          title="The following tags/types will be ignored when using a Scene Generator. This setting overrides any generator rules."
        >
          <div>
            <Typography variant="caption" className={classes.grey}>
              Ignored Tags/Types
            </Typography>
            <LibrarySearch
              displaySources={library}
              filters={ignoredTags}
              isLibrary
              isClearable
              onlyTagsAndTypes
              showCheckboxes
              withBrackets
              placeholder={'Search ...'}
              hideSelectedOptions={false}
              onUpdateFilters={onSelectTags}
              inputVariant="standard"
            />
          </div>
        </Tooltip>
      </Grid>
    </Grid>
  )
}

;(PlayerNumCard as any).displayName = 'PlayerNumCard'
export default PlayerNumCard
