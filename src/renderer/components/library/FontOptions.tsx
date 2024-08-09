import { Collapse, Grid, InputAdornment, type Theme } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { type FontSettingsType } from '../../../store/captionScript/FontSettings'
import ColorPicker from '../config/ColorPicker'

import BaseTextField from '../common/text/BaseTextField'
import BaseSwitch from '../common/BaseSwitch'
import FontFamilySelect from '../common/FontFamilySelect'
import {
  setCaptionScriptFontSettingsBorder,
  setCaptionScriptFontSettingsColor,
  setCaptionScriptFontSettingsBorderColor,
  setCaptionScriptFontSettingsFontFamily,
  setCaptionScriptFontSettingsFontSize,
  setCaptionScriptFontSettingsBorderPx
} from '../../../store/captionScript/actions'
import {
  selectCaptionScriptFontSettingsBorder,
  selectCaptionScriptFontSettingsColor,
  selectCaptionScriptFontSettingsBorderColor,
  selectCaptionScriptFontSettingsFontFamily,
  selectCaptionScriptFontSettingsFontSize,
  selectCaptionScriptFontSettingsBorderPx
} from '../../../store/captionScript/selectors'
import { useAppSelector } from '../../../store/hooks'

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: '100%'
    },
    noPadding: {
      padding: '0 !important'
    },
    endInput: {
      paddingLeft: theme.spacing(1),
      paddingTop: 0
    },
    fontDivider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2)
    },
    fontProgress: {
      position: 'absolute'
    }
  })

export interface FontOptionsProps extends WithStyles<typeof styles> {
  name: string
  captionScriptID: number
  type: FontSettingsType
}

function FontOptions (props: FontOptionsProps) {
  const classes = props.classes
  const border = useAppSelector(
    selectCaptionScriptFontSettingsBorder(props.captionScriptID, props.type)
  )

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={9}>
        <FontFamilySelect
          label={`${props.name} Font`}
          controlClassName={classes.fullWidth}
          selector={selectCaptionScriptFontSettingsFontFamily(
            props.captionScriptID,
            props.type
          )}
          action={setCaptionScriptFontSettingsFontFamily(
            props.captionScriptID,
            props.type
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <BaseTextField
          variant="standard"
          label="Size"
          margin="dense"
          selector={selectCaptionScriptFontSettingsFontSize(
            props.captionScriptID,
            props.type
          )}
          action={setCaptionScriptFontSettingsFontSize(
            props.captionScriptID,
            props.type
          )}
          InputProps={{
            endAdornment: <InputAdornment position="end">px</InputAdornment>
          }}
          inputProps={{
            min: 1,
            type: 'number'
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <ColorPicker
          selector={selectCaptionScriptFontSettingsColor(
            props.captionScriptID,
            props.type
          )}
          action={setCaptionScriptFontSettingsColor(
            props.captionScriptID,
            props.type
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <BaseSwitch
          label="Border"
          size="small"
          selector={selectCaptionScriptFontSettingsBorder(
            props.captionScriptID,
            props.type
          )}
          action={setCaptionScriptFontSettingsBorder(
            props.captionScriptID,
            props.type
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <Collapse in={border}>
          <BaseTextField
            variant="standard"
            label="Width"
            margin="dense"
            selector={selectCaptionScriptFontSettingsBorderPx(
              props.captionScriptID,
              props.type
            )}
            action={setCaptionScriptFontSettingsBorderPx(
              props.captionScriptID,
              props.type
            )}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>
            }}
            inputProps={{
              min: 1,
              type: 'number'
            }}
          />
        </Collapse>
      </Grid>
      <Grid item xs={9}>
        <Collapse in={border}>
          <ColorPicker
            selector={selectCaptionScriptFontSettingsBorderColor(
              props.captionScriptID,
              props.type
            )}
            action={setCaptionScriptFontSettingsBorderColor(
              props.captionScriptID,
              props.type
            )}
          />
        </Collapse>
      </Grid>
    </Grid>
  )
}

;(FontOptions as any).displayName = 'FontOptions'
export default withStyles(styles)(FontOptions as any)
