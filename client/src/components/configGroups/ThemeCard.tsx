import * as React from 'react'
import clsx from 'clsx'

import { type Theme, Typography } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

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

const styles = (theme: Theme) =>
  createStyles({
    themePicker: {
      [theme.breakpoints.up('sm')]: {
        maxWidth: theme.spacing(47)
      }
    },
    gutterBottom: {
      marginBottom: theme.spacing(2)
    }
  })

function ThemeCard(props: WithStyles<typeof styles>) {
  const classes = props.classes
  return (
    <React.Fragment>
      <div>
        <BaseSwitch
          label="Dark Mode"
          selector={selectAppThemeMode()}
          action={setThemeMode}
        />
      </div>
      <div className={clsx(classes.themePicker, classes.gutterBottom)}>
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
export default withStyles(styles)(ThemeCard as any)
