import {
  Collapse,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  type Theme
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { WC } from '../../data/const'
import en from '../../data/en'
import ColorPicker from '../config/ColorPicker'
import BaseSelect from '../common/BaseSelect'
import { useAppSelector } from '../../../store/hooks'
import {
  setConfigGeneralSettingsWatermark,
  setConfigGeneralSettingsWatermarkGrid,
  setConfigGeneralSettingsWatermarkCorner,
  setConfigGeneralSettingsWatermarkFontFamily,
  setConfigGeneralSettingsWatermarkColor,
  setConfigGeneralSettingsWatermarkText,
  setConfigGeneralSettingsWatermarkFontSize
} from '../../../store/app/slice'
import {
  selectAppConfigGeneralSettingsWatermark,
  selectAppConfigGeneralSettingsWatermarkGrid,
  selectAppConfigGeneralSettingsWatermarkCorner,
  selectAppConfigGeneralSettingsWatermarkFontFamily,
  selectAppConfigGeneralSettingsWatermarkColor,
  selectAppConfigGeneralSettingsWatermarkText,
  selectAppConfigGeneralSettingsWatermarkFontSize
} from '../../../store/app/selectors'
import BaseSwitch from '../common/BaseSwitch'
import BaseTextField from '../common/text/BaseTextField'
import FontFamilySelect from '../common/FontFamilySelect'

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: '100%'
    }
  })

function WatermarkCard(props: WithStyles<typeof styles>) {
  const watermark = useAppSelector(selectAppConfigGeneralSettingsWatermark())

  const classes = props.classes
  return (
    <Grid container spacing={watermark ? 2 : 0} alignItems="center">
      <Grid item xs={12}>
        <Grid container alignItems="center">
          <Grid item xs={12} sm={6}>
            <BaseSwitch
              label="Enable Watermark"
              tooltip={
                <div>
                  When enabled, FlipFlip will display a watermark over each
                  Scene. You may use the following variables:
                  <br />
                  {'{scene_name}'} - Name of the current Scene
                  <br />
                  {'{source_url}'} - URL of the current Source
                  <br />
                  {'{source_name}'} - Name of the current Source
                  <br />
                  {'{post_url}'} - URL of the current file's post
                  <br />
                  {'{file_url}'} - URL of the current file
                  <br />
                  {'{file_name}'} - Name of the current file
                  <br />
                  {'{audio_url}'} - URL of the currently playing audio file
                  <br />
                  {'{audio_name}'} - Name of the currently playing audio file
                  <br />
                  {'{audio_title}'} - Title of the currently playing audio file
                  <br />
                  {'{audio_artist}'} - Artist of the currently playing audio
                  file
                  <br />
                  {'{audio_album}'} - Album of the currently playing audio file
                </div>
              }
              selector={selectAppConfigGeneralSettingsWatermark()}
              action={setConfigGeneralSettingsWatermark}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {watermark && (
              <BaseSwitch
                label="Show on Grids"
                tooltip="When enabled, watermark will display on Grid Scenes"
                selector={selectAppConfigGeneralSettingsWatermarkGrid()}
                action={setConfigGeneralSettingsWatermarkGrid}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={watermark} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={watermark} className={classes.fullWidth}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <BaseSelect
                label="Watermark Corner"
                controlClassName={classes.fullWidth}
                selector={selectAppConfigGeneralSettingsWatermarkCorner()}
                action={setConfigGeneralSettingsWatermarkCorner}
              >
                {Object.values(WC).map((wc) => (
                  <MenuItem value={wc} key={wc}>
                    {en.get(wc)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Grid>
            <Grid item xs={12}>
              <BaseTextField
                variant="standard"
                fullWidth
                multiline
                label="Watermark Text"
                selector={selectAppConfigGeneralSettingsWatermarkText()}
                action={setConfigGeneralSettingsWatermarkText}
                margin="dense"
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={watermark} className={classes.fullWidth}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={9}>
              <FontFamilySelect
                label="Font"
                controlClassName={classes.fullWidth}
                selector={selectAppConfigGeneralSettingsWatermarkFontFamily()}
                action={setConfigGeneralSettingsWatermarkFontFamily}
              />
            </Grid>
            <Grid item xs={3}>
              <BaseTextField
                variant="standard"
                label="Size"
                margin="dense"
                selector={selectAppConfigGeneralSettingsWatermarkFontSize()}
                action={setConfigGeneralSettingsWatermarkFontSize}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">px</InputAdornment>
                  )
                }}
                inputProps={{
                  min: 1,
                  type: 'number'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ColorPicker
                selector={selectAppConfigGeneralSettingsWatermarkColor()}
                action={setConfigGeneralSettingsWatermarkColor}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  )
}

;(WatermarkCard as any).displayName = 'WatermarkCard'
export default withStyles(styles)(WatermarkCard as any)
