import * as React from 'react'

import { Fab, Grid2, TextField, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import * as color from '@mui/material/colors'
import type ReduxProps from '../common/ReduxProps'
import { useAppDispatch } from '../../store/hooks'
import { ColorPartial } from '@mui/material/styles/createPalette'

const useStyles = makeStyles()((theme: Theme) => ({
  colorGrid: {
    width: 170
  },
  colorButton: {
    backgroundColor: theme.palette.common.white,
    marginTop: 0,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    boxShadow: 'none'
  },
  colorPickerButton: {
    backgroundColor: theme.palette.common.white,
    marginRight: theme.spacing(0.25),
    width: theme.spacing(2),
    height: theme.spacing(2),
    minHeight: theme.spacing(2),
    boxShadow: 'none'
  },
  colorField: {
    width: 100
  }
}))

const colors = new Map([
  ['red', color.red as ColorPartial], 
  ['pink', color.pink as ColorPartial], 
  ['purple', color.purple as ColorPartial], 
  ['deepPurple', color.deepPurple as ColorPartial], 
  ['indigo', color.indigo as ColorPartial], 
  ['blue', color.blue as ColorPartial], 
  ['lightBlue', color.lightBlue as ColorPartial], 
  ['cyan', color.cyan as ColorPartial], 
  ['teal', color.teal as ColorPartial], 
  ['green', color.green as ColorPartial], 
  ['lightGreen', color.lightGreen as ColorPartial], 
  ['lime', color.lime as ColorPartial], 
  ['yellow', color.yellow as ColorPartial], 
  ['amber', color.amber as ColorPartial], 
  ['orange', color.orange as ColorPartial], 
  ['deepOrange', color.deepOrange as ColorPartial], 
  ['brown', color.brown as ColorPartial], 
  ['grey', color.grey as ColorPartial], 
  ['blueGrey', color.blueGrey as ColorPartial],
])

const getColorValue = (currentColor?: string) => {
  switch(currentColor) {
    case 'white':
      return color.common.white
    case 'black':
      return color.common.black
    default:
      const colorPartial = currentColor != null ? colors.get(currentColor) : undefined
      return colorPartial != null ? colorPartial[500] : undefined
  }
}

export interface ThemeColorPickerProps extends ReduxProps<string> {}

function ThemeColorPicker(props: ThemeColorPickerProps) {
  const dispatch = useAppDispatch()
  const { data: currentColor } = props.selector()

  const onChangeColor = (color: string) => dispatch(props.action(color))

  const colorValue = getColorValue(currentColor)
  const { classes } = useStyles()
  return (
    <Grid2 container alignItems="center">
      <Grid2 className={classes.colorGrid}>
        <Fab
          className={classes.colorButton}
          style={{ backgroundColor: colorValue }}
          size="medium"
        >
          <div />
        </Fab>
        <TextField
          variant="standard"
          className={classes.colorField}
          label="Color"
          slotProps={{
            input: {
              readOnly: true
            }
          }}
          value={colorValue ?? ''}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 'grow' }}>
        <Grid2 container alignItems="center">
          {[...colors.keys()].map((key) => (
            <Grid2 key={key}>
              <Fab
                className={classes.colorPickerButton}
                style={{ backgroundColor: colors.get(key)![500] }}
                value={colors.get(key)![500]}
                onClick={() => onChangeColor(key)}
                size="small"
              >
                <div />
              </Fab>
            </Grid2>
          ))}
          <Grid2 key={color.common.white}>
            <Fab
              className={classes.colorPickerButton}
              style={{ backgroundColor: color.common.white }}
              value={color.common.white}
              onClick={() => onChangeColor('white')}
              size="small"
            >
              <div />
            </Fab>
          </Grid2>
          <Grid2 key={color.common.black}>
            <Fab
              className={classes.colorPickerButton}
              style={{ backgroundColor: color.common.black }}
              value={color.common.black}
              onClick={() => onChangeColor('black')}
              size="small"
            >
              <div />
            </Fab>
          </Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
  )
}

;(ThemeColorPicker as any).displayName = 'ThemeColorPicker'
export default ThemeColorPicker
