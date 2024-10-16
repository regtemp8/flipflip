import {
  Collapse,
  Divider,
  Grid2,
  InputAdornment,
  MenuItem
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { en, WC } from 'flipflip-common'
import ColorPicker from '../config/ColorPicker'
import BaseSelect from '../common/BaseSelect'
import {
  setConfigGeneralSettingsWatermark,
  setConfigGeneralSettingsWatermarkDisplay,
  setConfigGeneralSettingsWatermarkCorner,
  setConfigGeneralSettingsWatermarkFontFamily,
  setConfigGeneralSettingsWatermarkColor,
  setConfigGeneralSettingsWatermarkText,
  setConfigGeneralSettingsWatermarkFontSize
} from '../../store/api/thunks'
import {
  useGetGeneralSettingsWatermarkQuery,
  useGetGeneralSettingsWatermarkDisplayQuery,
  useGetGeneralSettingsWatermarkCornerQuery,
  useGetGeneralSettingsWatermarkFontFamilyQuery,
  useGetGeneralSettingsWatermarkColorQuery,
  useGetGeneralSettingsWatermarkTextQuery,
  useGetGeneralSettingsWatermarkFontSizeQuery
} from '../../store/api/selectors'
import BaseSwitch from '../common/BaseSwitch'
import BaseTextField from '../common/text/BaseTextField'
import FontFamilySelect from '../common/FontFamilySelect'

const useStyles = makeStyles()(() => ({
  fullWidth: {
    width: '100%'
  }
}))

function WatermarkCard() {
  const { data: watermark } = useGetGeneralSettingsWatermarkQuery()

  const { classes } = useStyles()
  return (
    <Grid2 container spacing={watermark ? 2 : 0} alignItems="center">
      <Grid2 size={12}>
        <Grid2 container alignItems="center">
          <Grid2 size={{ xs: 12, sm: 6 }}>
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
              selector={useGetGeneralSettingsWatermarkQuery}
              action={setConfigGeneralSettingsWatermark}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            {watermark && (
              <BaseSwitch
                label="Show on Displays"
                tooltip="When enabled, watermark will show on each Scene in a Display"
                selector={useGetGeneralSettingsWatermarkDisplayQuery}
                action={setConfigGeneralSettingsWatermarkDisplay}
              />
            )}
          </Grid2>
        </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={watermark} className={classes.fullWidth}>
          <Divider />
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={watermark} className={classes.fullWidth}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={12}>
              <BaseSelect
                label="Watermark Corner"
                controlClassName={classes.fullWidth}
                selector={useGetGeneralSettingsWatermarkCornerQuery}
                action={setConfigGeneralSettingsWatermarkCorner}
              >
                {Object.values(WC).map((wc) => (
                  <MenuItem value={wc} key={wc}>
                    {en.get(wc)}
                  </MenuItem>
                ))}
              </BaseSelect>
            </Grid2>
            <Grid2 size={12}>
              <BaseTextField
                variant="standard"
                fullWidth
                multiline
                label="Watermark Text"
                selector={useGetGeneralSettingsWatermarkTextQuery}
                action={setConfigGeneralSettingsWatermarkText}
                margin="dense"
              />
            </Grid2>
          </Grid2>
        </Collapse>
      </Grid2>
      <Grid2 size={12}>
        <Collapse in={watermark} className={classes.fullWidth}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={9}>
              <FontFamilySelect
                label="Font"
                controlClassName={classes.fullWidth}
                selector={useGetGeneralSettingsWatermarkFontFamilyQuery}
                action={setConfigGeneralSettingsWatermarkFontFamily}
              />
            </Grid2>
            <Grid2 size={3}>
              <BaseTextField
                variant="standard"
                label="Size"
                margin="dense"
                selector={useGetGeneralSettingsWatermarkFontSizeQuery}
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
            </Grid2>
            <Grid2 size={12}>
              <ColorPicker
                selector={useGetGeneralSettingsWatermarkColorQuery}
                action={setConfigGeneralSettingsWatermarkColor}
              />
            </Grid2>
          </Grid2>
        </Collapse>
      </Grid2>
    </Grid2>
  )
}

;(WatermarkCard as any).displayName = 'WatermarkCard'
export default WatermarkCard
