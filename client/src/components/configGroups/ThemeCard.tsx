import * as React from 'react'
import { cx } from '@emotion/css'

import { type Theme, Typography } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import ThemeColorPicker from '../config/ThemeColorPicker'

import BaseSwitch from '../common/BaseSwitch'
import {
  useGetThemeModeQuery,
  useGetThemePrimaryColorQuery,
  useGetThemeSecondaryColorQuery
} from '../../store/api/selectors'
import {
  setThemeMode,
  setThemePrimaryColor,
  setThemeSecondaryColor
} from '../../store/api/thunks'

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

// TODO set theme colors based on primary/secondary color, it expects an object
function ThemeCard() {
  const { classes } = useStyles()
  return (
    <React.Fragment>
      <div>
        <BaseSwitch
          label="Dark Mode"
          selector={useGetThemeModeQuery}
          action={setThemeMode()}
        />
      </div>
      <div className={cx(classes.themePicker, classes.gutterBottom)}>
        <Typography>Primary Color</Typography>
        <ThemeColorPicker
          selector={useGetThemePrimaryColorQuery}
          action={setThemePrimaryColor()}
        />
      </div>
      <div className={classes.themePicker}>
        <Typography>Secondary Color</Typography>
        <ThemeColorPicker
          selector={useGetThemeSecondaryColorQuery}
          action={setThemeSecondaryColor()}
        />
      </div>
    </React.Fragment>
  )
}

;(ThemeCard as any).displayName = 'ThemeCard'
export default ThemeCard
