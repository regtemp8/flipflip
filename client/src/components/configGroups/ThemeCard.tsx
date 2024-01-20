import * as React from 'react'
import { cx } from '@emotion/css'

import { type Theme, Typography } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ThemeColorPicker from '../config/ThemeColorPicker'

import BaseSwitch from '../common/BaseSwitch'
import {
  setThemeMode,
  setThemePalettePrimary,
  setThemePaletteSecondary
} from '../../store/app/slice'
import {
  selectAppThemeMode,
  selectAppThemePalettePrimaryMain,
  selectAppThemePaletteSecondaryMain
} from '../../store/app/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
  themePicker: {
    [theme.breakpoints.up('sm')]: {
      maxWidth: theme.spacing(47)
    }
  },
  gutterBottom: {
    marginBottom: theme.spacing(2)
  }
}))

function ThemeCard() {
  const { classes } = useStyles()
  return (
    <React.Fragment>
      <div>
        <BaseSwitch
          label="Dark Mode"
          selector={selectAppThemeMode()}
          action={setThemeMode}
        />
      </div>
      <div className={cx(classes.themePicker, classes.gutterBottom)}>
        <Typography>Primary Color</Typography>
        <ThemeColorPicker
          selector={selectAppThemePalettePrimaryMain()}
          action={setThemePalettePrimary}
        />
      </div>
      <div className={classes.themePicker}>
        <Typography>Secondary Color</Typography>
        <ThemeColorPicker
          selector={selectAppThemePaletteSecondaryMain()}
          action={setThemePaletteSecondary}
        />
      </div>
    </React.Fragment>
  )
}

;(ThemeCard as any).displayName = 'ThemeCard'
export default ThemeCard
