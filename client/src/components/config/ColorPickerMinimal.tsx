import React, { type MouseEvent, useState } from 'react'
import { SketchPicker } from 'react-color'

import { Fab, Menu, type Theme, Tooltip } from '@mui/material'

import { makeStyles } from 'tss-react/mui'
import type ReduxProps from '../common/ReduxProps'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const useStyles = makeStyles()((theme: Theme) => ({
  colorPickerButton: {
    backgroundColor: theme.palette.common.white,
    width: theme.spacing(2),
    height: theme.spacing(2),
    minHeight: theme.spacing(2),
    boxShadow: 'none'
  }
}))

export interface ColorPickerMinimalProps extends ReduxProps<string> {
  canPick?: boolean
}

function ColorPickerMinimal(props: ColorPickerMinimalProps) {
  const dispatch = useAppDispatch()
  const currentColor = useAppSelector(props.selector)

  const [pickerColor, setPickerColor] = useState<any>()
  const [pickerAnchorEl, setPickerAnchorEl] = useState<any>()

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

  const { classes } = useStyles()
  const canPick = props.canPick ?? true
  return canPick ? (
    <>
      <Tooltip disableInteractive title="Pick Color">
        <Fab
          className={classes.colorPickerButton}
          style={{
            backgroundColor: pickerColor
              ? pickerColor.hex
                ? pickerColor.hex
                : pickerColor
              : currentColor
          }}
          onClick={onToggleColorPicker}
          size="small"
        >
          <div />
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
        onClose={onToggleColorPicker}
      >
        <SketchPicker
          color={pickerColor || currentColor}
          disableAlpha={false}
          presetColors={[]}
          onChange={onChangePickerColor}
        />
      </Menu>
    </>
  ) : (
    <Fab
      className={classes.colorPickerButton}
      style={{
        backgroundColor: pickerColor
          ? pickerColor.hex
            ? pickerColor.hex
            : pickerColor
          : currentColor
      }}
      size="small"
    >
      <div />
    </Fab>
  )
}

;(ColorPickerMinimal as any).displayName = 'ColorPickerMinimal'
export default ColorPickerMinimal
