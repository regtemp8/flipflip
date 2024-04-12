import { type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import {
  setDisplayViewHeight,
  setDisplayViewX,
  setDisplayViewY,
  setDisplayViewWidth,
  setDisplayViewOpacity,
  setDisplayViewZ
} from '../../store/displayView/actions'
import {
  selectDisplayViewHeight,
  selectDisplayViewOpacity,
  selectDisplayViewWidth,
  selectDisplayViewX,
  selectDisplayViewY,
  selectDisplayViewZ
} from '../../store/displayView/selectors'
import BaseSlider from '../common/slider/BaseSlider'

const useStyles = makeStyles()((theme: Theme) => ({
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0
  }
}))

export interface DisplayViewSettingsProps {
  viewID: number
}

function DisplayViewSettings(props: DisplayViewSettingsProps) {
  const { viewID } = props
  const { classes } = useStyles()
  const xSelector = selectDisplayViewX(viewID)
  const ySelector = selectDisplayViewY(viewID)
  const zSelector = selectDisplayViewZ(viewID)
  const widthSelector = selectDisplayViewWidth(viewID)
  const heightSelector = selectDisplayViewHeight(viewID)
  const opacitySelector = selectDisplayViewOpacity(viewID)
  const xAction = setDisplayViewX(viewID)
  const yAction = setDisplayViewY(viewID)
  const zAction = setDisplayViewZ(viewID)
  const widthAction = setDisplayViewWidth(viewID)
  const heightAction = setDisplayViewHeight(viewID)
  const opacityAction = setDisplayViewOpacity(viewID)

  return (
    <>
      <BaseSlider
        selector={xSelector}
        action={xAction}
        min={0}
        max={100}
        labelledBy="display-view-x-slider"
        format={{ type: 'percent' }}
        label={{
          text: 'X:',
          variant: 'body1',
          color: 'text.primary',
          appendValue: true
        }}
        textField={{
          className: classes.endInput,
          step: 5
        }}
      />
      <BaseSlider
        selector={ySelector}
        action={yAction}
        min={0}
        max={100}
        labelledBy="display-view-y-slider"
        format={{ type: 'percent' }}
        label={{
          text: 'Y:',
          variant: 'body1',
          color: 'text.primary',
          appendValue: true
        }}
        textField={{
          className: classes.endInput,
          step: 5
        }}
      />
      <BaseSlider
        selector={zSelector}
        action={zAction}
        min={0}
        max={10}
        labelledBy="display-view-z-slider"
        label={{
          text: 'Z:',
          variant: 'body1',
          color: 'text.primary',
          appendValue: true
        }}
        textField={{
          className: classes.endInput,
          step: 1
        }}
      />
      <BaseSlider
        selector={widthSelector}
        action={widthAction}
        min={0}
        max={100}
        labelledBy="display-view-width-slider"
        format={{ type: 'percent' }}
        label={{
          text: 'Width:',
          variant: 'body1',
          color: 'text.primary',
          appendValue: true
        }}
        textField={{
          className: classes.endInput,
          step: 5
        }}
      />
      <BaseSlider
        selector={heightSelector}
        action={heightAction}
        min={0}
        max={100}
        labelledBy="display-view-height-slider"
        format={{ type: 'percent' }}
        label={{
          text: 'Height:',
          variant: 'body1',
          color: 'text.primary',
          appendValue: true
        }}
        textField={{
          className: classes.endInput,
          step: 5
        }}
      />
      <BaseSlider
        selector={opacitySelector}
        action={opacityAction}
        min={0}
        max={100}
        labelledBy="display-view-opacity-slider"
        format={{ type: 'percent' }}
        label={{
          text: 'Opacity:',
          variant: 'body1',
          color: 'text.primary',
          appendValue: true
        }}
        textField={{
          className: classes.endInput,
          step: 5
        }}
      />
    </>
  )
}

;(DisplayViewSettings as any).displayName = 'DisplayViewSettings'
export default DisplayViewSettings
