import { createTheme } from '@mui/material'
import { ThemeOptions, ThemeProvider } from '@mui/material/styles'

import { PropsWithChildren } from 'react'
import { useGetThemeQuery } from '../store/api/slice'
import { copy } from 'flipflip-common'
import { defaultTheme } from '../theme'
import { ColorPartial, PaletteColorOptions, PaletteMode } from '@mui/material/styles/createPalette'
import {red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, lime, yellow, amber, orange, deepOrange, brown, grey, blueGrey, common} from "@mui/material/colors"

const colors = new Map([
  ['red', red as ColorPartial], 
  ['pink', pink as ColorPartial], 
  ['purple', purple as ColorPartial], 
  ['deepPurple', deepPurple as ColorPartial], 
  ['indigo', indigo as ColorPartial], 
  ['blue', blue as ColorPartial], 
  ['lightBlue', lightBlue as ColorPartial], 
  ['cyan', cyan as ColorPartial], 
  ['teal', teal as ColorPartial], 
  ['green', green as ColorPartial], 
  ['lightGreen', lightGreen as ColorPartial], 
  ['lime', lime as ColorPartial], 
  ['yellow', yellow as ColorPartial], 
  ['amber', amber as ColorPartial], 
  ['orange', orange as ColorPartial], 
  ['deepOrange', deepOrange as ColorPartial], 
  ['brown', brown as ColorPartial], 
  ['grey', grey as ColorPartial], 
  ['blueGrey', blueGrey as ColorPartial]
])

function getPalette(colorName: string): PaletteColorOptions | undefined {
  if (colorName === 'black') {
      const black = common.black
      return {
          50: grey[50],
          100: grey[100],
          200: grey[200],
          300: grey[300],
          400: grey[400],
          500: grey[500],
          600: grey[600],
          700: grey[700],
          800: grey[800],
          900: grey[900],
          A100: grey.A100,
          A200: grey.A200,
          A400: grey.A400,
          A700: grey.A700,
          main: black
        }
  } else if (colorName === 'white') {
      const white = common.white
      return {
          50: grey[900],
          100: grey[800],
          200: grey[700],
          300: grey[600],
          400: grey[500],
          500: grey[400],
          600: grey[300],
          700: grey[200],
          800: grey[100],
          900: grey[50],
          A100: grey.A700,
          A200: grey.A400,
          A400: grey.A200,
          A700: grey.A100,
          main: white
        }
  } else {
      console.log('COLOR', colorName)
      const color = colors.get(colorName)
      return color != null ? {
          50: color[50],
          100: color[100],
          200: color[200],
          300: color[300],
          400: color[400],
          500: color[500],
          600: color[600],
          700: color[700],
          800: color[800],
          900: color[900],
          A100: color.A100,
          A200: color.A200,
          A400: color.A400,
          A700: color.A700,
          main: color[500]
        } : undefined
  }
}

const AppThemeProvider = ({children}: PropsWithChildren) => {
  const {data} = useGetThemeQuery()
  console.log('QUERY', data)
  const theme = copy<ThemeOptions>(defaultTheme as ThemeOptions)
  if(data?.primaryColor != null) {
      theme.palette!.primary = getPalette(data?.primaryColor)
  }
  if(data?.secondaryColor != null) {
      theme.palette!.secondary = getPalette(data?.secondaryColor)
  }

  let mode: PaletteMode = 'light'
  if(data != null) {
    if(data.mode === 'dark') {
      mode = 'dark'
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    mode = 'dark'
  }

  theme.palette!.mode = mode
  if(mode === 'dark') {
      theme.palette!.background = {}
  } else {
      const primary = theme.palette!.primary as ColorPartial
      theme.palette!.background = {
          default: primary[50]
      }
  }

  return (
    <ThemeProvider theme={createTheme(theme as ThemeOptions)}>
      {children}
    </ThemeProvider>
  )
}
export default AppThemeProvider
