import React, { type ChangeEvent, type MouseEvent, useState } from 'react'
import { Color, HEXColor, SketchPicker } from 'react-color'

import { Fab, Grid2, Menu, TextField, type Theme, Tooltip } from '@mui/material'

import { makeStyles } from 'tss-react/mui'
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

const COLORS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#9e9e9e',
  '#607d8b',
  '#fff',
  '#000'
]

export interface ColorPickerProps extends ReduxProps<string> {}

function ColorPicker(props: ColorPickerProps) {
  const dispatch = useAppDispatch()
  const { data: currentColor } = props.selector()

  const [pickerColor, setPickerColor] = useState<Color>()
  const [pickerAnchorEl, setPickerAnchorEl] = useState<Element>()

  const onToggleColorPicker = (e: MouseEvent) => {
    if (pickerColor) {
      onChangeColor(pickerColor)
      setPickerColor(undefined)
      setPickerAnchorEl(undefined)
    } else {
      setPickerColor(currentColor)
      setPickerAnchorEl(e.currentTarget)
    }
  }

  const onChangePickerColor = (color: any) => {
    setPickerColor(color)
  }

  const onChangeColor = (color: any) => {
    const value = color?.hex ?? color
    dispatch(props.action(value))
  }

  const getStyleValue = (
    pickerColor?: Color,
    currentColor?: string
  ): string => {
    return (pickerColor as HEXColor)?.hex ?? pickerColor ?? currentColor
  }

  const getTextValue = (pickerColor?: Color, currentColor?: string): string => {
    return (pickerColor as HEXColor)?.hex ?? pickerColor ?? currentColor ?? ''
  }

  const { classes } = useStyles()
  return (
    <Grid2 container alignItems="center">
      <Grid2 className={classes.colorGrid}>
        <Tooltip disableInteractive title="Pick Color">
          <Fab
            className={classes.colorButton}
            style={{
              backgroundColor: getStyleValue(pickerColor, currentColor)
            }}
            onClick={onToggleColorPicker}
            size="medium"
          >
            <div />
          </Fab>
        </Tooltip>
        <TextField
          variant="standard"
          className={classes.colorField}
          label="Color"
          value={getTextValue(pickerColor, currentColor)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            dispatch(props.action(e.target.value))
          }
        />
        <Menu
          id="color-picker"
          elevation={1}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          anchorEl={pickerAnchorEl}
          keepMounted
          open={!!pickerColor}
          onClose={onToggleColorPicker}
        >
          <SketchPicker
            color={pickerColor || currentColor}
            disableAlpha={false}
            presetColors={[]}
            onChange={onChangePickerColor}
          />
        </Menu>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 'grow' }}>
        <Grid2 container alignItems="center">
          {COLORS.map((c) => (
            <Grid2 key={c}>
              <Fab
                className={classes.colorPickerButton}
                style={{ backgroundColor: c }}
                value={c}
                onClick={(e: MouseEvent<HTMLButtonElement>) =>
                  dispatch(props.action(e.currentTarget.value))
                }
                size="small"
              >
                <div />
              </Fab>
            </Grid2>
          ))}
        </Grid2>
      </Grid2>
    </Grid2>
  )
}

;(ColorPicker as any).displayName = 'ColorPicker'
export default ColorPicker
