import * as React from 'react'

import { Fab, Grid2, TextField, type Theme } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import * as color from '@mui/material/colors'
import type ReduxProps from '../common/ReduxProps'
import { useAppDispatch } from '../../store/hooks'

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

const colors = [
  color.red,
  color.pink,
  color.purple,
  color.deepPurple,
  color.indigo,
  color.blue,
  color.lightBlue,
  color.cyan,
  color.teal,
  color.green,
  color.lightGreen,
  color.lime,
  color.yellow,
  color.amber,
  color.orange,
  color.deepOrange,
  color.brown,
  color.grey,
  color.blueGrey
]

export interface ThemeColorPickerProps extends ReduxProps<string> {}

function ThemeColorPicker(props: ThemeColorPickerProps) {
  const dispatch = useAppDispatch()
  const { data: currentColor } = props.selector()

  const onChangeColor = (color: string) => dispatch(props.action(color))

  const { classes } = useStyles()
  return (
    <Grid2 container alignItems="center">
      <Grid2 className={classes.colorGrid}>
        <Fab
          className={classes.colorButton}
          style={{ backgroundColor: currentColor }}
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
          value={currentColor ?? ''}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 'grow' }}>
        <Grid2 container alignItems="center">
          {colors.map((c) => (
            <Grid2 key={c[500]}>
              <Fab
                className={classes.colorPickerButton}
                style={{ backgroundColor: c[500] }}
                value={c[500]}
                onClick={() => onChangeColor(c[500])}
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
              onClick={() => onChangeColor(color.common.white)}
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
              onClick={() => onChangeColor(color.common.black)}
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
