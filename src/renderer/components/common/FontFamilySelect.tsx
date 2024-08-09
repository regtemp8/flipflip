import React, { useEffect, useRef, useState } from 'react'
import { MenuItem } from '@mui/material'
import { CancelablePromise } from '../../data/utils'
import BaseSelect from './BaseSelect'
import { useAppSelector } from '../../../store/hooks'
import type ReduxProps from './ReduxProps'

export interface FontFamilySelectProps extends ReduxProps<string> {
  label: string
  controlClassName: string
}

export default function FontFamilySelect (props: FontFamilySelectProps) {
  const _promise = useRef<CancelablePromise>()
  const [systemFonts, setSystemFonts] = useState<string[]>([])

  useEffect(() => {
    // Define system fonts
    _promise.current = new CancelablePromise((resolve, reject) => {
      window.flipflip.api.getSystemFonts().then(
        (res: string[]) => {
          if (!_promise.current?.hasCanceled) {
            setSystemFonts(res)
          }
        },
        (err: string) => {
          reject(err)
        }
      )
    })

    return () => {
      _promise.current?.cancel()
    }
  }, [])

  const mapFontFamily = (fontFamily: string) => {
    if (systemFonts.length === 0) {
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

  let fontFamily = useAppSelector(props.selector)
  fontFamily = mapFontFamily(fontFamily)
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
