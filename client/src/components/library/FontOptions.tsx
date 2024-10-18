import { Collapse, Grid2, InputAdornment, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { type FontSettingsType } from 'flipflip-common'
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
} from '../../store/api/thunks'
import {
  useGetCaptionScriptFontSettingsBorderQuery,
  useGetCaptionScriptFontSettingsColorQuery,
  useGetCaptionScriptFontSettingsBorderColorQuery,
  useGetCaptionScriptFontSettingsFontFamilyQuery,
  useGetCaptionScriptFontSettingsFontSizeQuery,
  useGetCaptionScriptFontSettingsBorderPxQuery
} from '../../store/api/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
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
}))

export interface FontOptionsProps {
  name: string
  captionScriptID: number
  type: FontSettingsType
}

function FontOptions(props: FontOptionsProps) {
  const { classes } = useStyles()
  const {data: border} = useGetCaptionScriptFontSettingsBorderQuery(props.captionScriptID, props.type)

  return (
    <Grid2 container spacing={2} alignItems="center">
      <Grid2 size={9}>
        <FontFamilySelect
          label={`${props.name} Font`}
          controlClassName={classes.fullWidth}
          selector={() => useGetCaptionScriptFontSettingsFontFamilyQuery(
            props.captionScriptID,
            props.type
          )}
          action={setCaptionScriptFontSettingsFontFamily(
            props.captionScriptID,
            props.type
          )}
        />
      </Grid2>
      <Grid2 size={3}>
        <BaseTextField
          variant="standard"
          label="Size"
          margin="dense"
          selector={() => useGetCaptionScriptFontSettingsFontSizeQuery(
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
      </Grid2>
      <Grid2 size={12}>
        <ColorPicker
          selector={() => useGetCaptionScriptFontSettingsColorQuery(
            props.captionScriptID,
            props.type
          )}
          action={setCaptionScriptFontSettingsColor(
            props.captionScriptID,
            props.type
          )}
        />
      </Grid2>
      <Grid2 size={12}>
        <BaseSwitch
          label="Border"
          size="small"
          selector={() => useGetCaptionScriptFontSettingsBorderQuery(
            props.captionScriptID,
            props.type
          )}
          action={setCaptionScriptFontSettingsBorder(
            props.captionScriptID,
            props.type
          )}
        />
      </Grid2>
      <Grid2 size={3}>
        <Collapse in={border}>
          <BaseTextField
            variant="standard"
            label="Width"
            margin="dense"
            selector={() => useGetCaptionScriptFontSettingsBorderPxQuery(
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
      </Grid2>
      <Grid2 size={9}>
        <Collapse in={border}>
          <ColorPicker
            selector={() => useGetCaptionScriptFontSettingsBorderColorQuery(
              props.captionScriptID,
              props.type
            )}
            action={setCaptionScriptFontSettingsBorderColor(
              props.captionScriptID,
              props.type
            )}
          />
        </Collapse>
      </Grid2>
    </Grid2>
  )
}

;(FontOptions as any).displayName = 'FontOptions'
export default FontOptions
