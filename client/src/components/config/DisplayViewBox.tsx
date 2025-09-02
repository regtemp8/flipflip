import { Box, type Theme } from '@mui/material'
import { useGetDisplayViewQuery } from '../../store/api/slice'
import { useAppSelector } from '../../store/hooks'
import { selectDisplayViewError } from '../../store/display/selectors'

export interface DisplayViewBoxProps {
  viewID: number
  selected: boolean
}

function DisplayViewBox(props: DisplayViewBoxProps) {
  const { viewID, selected } = props
  const { data: view } = useGetDisplayViewQuery(viewID)
  const error = useAppSelector(selectDisplayViewError(viewID))
  const filter = error != null ? 'grayscale(100%)' : undefined
  return (
    <Box
      border={(theme: Theme) =>
        selected
          ? `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`
          : 'none'
      }
      sx={{
        position: 'absolute',
        background: view?.color,
        top: `${view?.y}%`,
        left: `${view?.x}%`,
        width: `${view?.width}%`,
        height: `${view?.height}%`,
        opacity: (view?.opacity ?? 0) / 100,
        zIndex: view?.z,
        filter
      }}
    ></Box>
  )
}

;(DisplayViewBox as any).displayName = 'DisplayViewBox'
export default DisplayViewBox
