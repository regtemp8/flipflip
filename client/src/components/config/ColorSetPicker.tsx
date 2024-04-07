import React, { useState, type MouseEvent } from 'react'
import { cx } from '@emotion/css'
import { SketchPicker } from 'react-color'

import { Fab, Grid, IconButton, Menu, type Theme, Tooltip } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import type ReduxProps from '../common/ReduxProps'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const useStyles = makeStyles()((theme: Theme) => ({
  colorGrid: {
    width: 64
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
  pickedColor: {
    border: 'black solid 3px'
  }
}))

export interface ColorSetPickerProps extends ReduxProps<string[]> {}

function ColorSetPicker(props: ColorSetPickerProps) {
  const dispatch = useAppDispatch()
  const currentColors = useAppSelector(props.selector)

  const [pickerIndex, setPickerIndex] = useState<number>()
  const [pickerColor, setPickerColor] = useState<string>()
  const [pickerAnchorEl, setPickerAnchorEl] = useState<any>()

  const onOpenColorPicker = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement
    let color, index
    if (target.id === 'add-color') {
      index = currentColors.length
      color = '#000000'
      dispatch(props.action(currentColors.concat(color)))
    } else {
      index = parseInt(target.id.replace('color-', ''))
      color = currentColors[index]
    }
    setPickerIndex(index)
    setPickerColor(color)
    setPickerAnchorEl(document.getElementById('add-color'))
  }

  const onCloseColorPicker = () => {
    const index = pickerIndex as number
    const color = pickerColor as string
    const newColors = [...currentColors]
    newColors[index] = color

    dispatch(props.action(newColors))
    setPickerIndex(undefined)
    setPickerColor(undefined)
    setPickerAnchorEl(undefined)
  }

  const onChangeColor = (color: any) => {
    setPickerColor(color.hex)
  }

  const onClearColors = () => {
    setPickerIndex(undefined)
    setPickerColor(undefined)
    setPickerAnchorEl(undefined)
    dispatch(props.action([]))
  }

  const { classes } = useStyles()
  return (
    <Grid container>
      <Grid item className={classes.colorGrid}>
        <Tooltip disableInteractive title="Add Color">
          <Fab
            id="add-color"
            className={classes.colorButton}
            style={pickerIndex != null ? { backgroundColor: pickerColor } : {}}
            onClick={onOpenColorPicker}
            size="medium"
          >
            {pickerIndex == null && <AddIcon />}
            {pickerIndex != null && <div />}
          </Fab>
        </Tooltip>
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
          onClose={onCloseColorPicker}
        >
          <SketchPicker
            color={pickerColor || '#000000'}
            disableAlpha={false}
            presetColors={[]}
            onChange={onChangeColor}
          />
        </Menu>
      </Grid>
      <Grid item xs>
        <Grid container alignItems="center">
          {currentColors.map((c, index) => (
            <Grid key={c + index} item>
              <Fab
                id={'color-' + index}
                className={cx(
                  classes.colorPickerButton,
                  index === pickerIndex && classes.pickedColor
                )}
                style={{ backgroundColor: c }}
                value={c}
                onClick={onOpenColorPicker}
                size="small"
              >
                <div />
              </Fab>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item>
        <Tooltip disableInteractive title="Clear Colors">
          <IconButton onClick={onClearColors} size="large">
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  )
}

;(ColorSetPicker as any).displayName = 'ColorSetPicker'
export default ColorSetPicker
