import { Box, type Theme } from '@mui/material'
import { selectDisplayView } from '../../store/displayView/selectors'
import { useAppSelector } from '../../store/hooks'

export interface DisplayViewBoxProps {
  viewID: number
  selected: boolean
}

function DisplayViewBox(props: DisplayViewBoxProps) {
  const { viewID, selected } = props
  const view = useAppSelector(selectDisplayView(viewID))
  return (
    <Box
      border={(theme: Theme) =>
        selected
          ? `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`
          : 'none'
      }
      sx={{
        position: 'absolute',
        background: view.color,
        top: `${view.y}%`,
        left: `${view.x}%`,
        width: `${view.width}%`,
        height: `${view.height}%`,
        opacity: view.opacity / 100,
        zIndex: view.z
      }}
    ></Box>
  )
}

;(DisplayViewBox as any).displayName = 'DisplayViewBox'
export default DisplayViewBox
