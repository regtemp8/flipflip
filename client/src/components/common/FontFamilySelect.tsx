import { MenuItem } from '@mui/material'
import BaseSelect from './BaseSelect'
import type ReduxProps from './ReduxProps'
import { useGetSystemFontsQuery } from '../../store/api/slice'

export interface FontFamilySelectProps extends ReduxProps<string> {
  label: string
  controlClassName: string
}

export default function FontFamilySelect(props: FontFamilySelectProps) {
  const { data: fontFamilyData } = props.selector()
  const { data: systemFontsData } = useGetSystemFontsQuery()

  const systemFonts = systemFontsData ?? []
  const mapFontFamily = (fontFamily?: string) => {
    if (systemFonts.length === 0 || fontFamily == null) {
      return ''
    } else if (fontFamily.includes(',')) {
      for (const font of fontFamily.split(',')) {
        if (systemFonts.includes(font)) {
          return font
        }
      }

      return ''
    } else {
      return fontFamily
    }
  }

  const fontFamily = mapFontFamily(fontFamilyData)
  return (
    <BaseSelect
      label={props.label}
      controlClassName={props.controlClassName}
      valueMapper={mapFontFamily}
      selector={props.selector}
      action={props.action}
      disabled={systemFonts.length === 0}
      style={{ fontFamily }}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 300
          }
        }
      }}
    >
      {systemFonts.map((f) => (
        <MenuItem key={f} value={f} style={{ fontFamily: f }}>
          {f}
        </MenuItem>
      ))}
    </BaseSelect>
  )
}
