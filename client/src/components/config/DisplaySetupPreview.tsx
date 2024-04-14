import { selectDisplayVisibleViews } from '../../store/display/selectors'
import { useAppSelector } from '../../store/hooks'
import DisplayViewBox from './DisplayViewBox'

export interface DisplaySetupPreviewProps {
  displayID: number
  selectedView?: number
}

function DisplaySetupPreview(props: DisplaySetupPreviewProps) {
  const views = useAppSelector(selectDisplayVisibleViews(props.displayID))
  return (
    <>
      {views.map((id) => (
        <DisplayViewBox
          key={id}
          viewID={id}
          selected={props.selectedView === id}
        />
      ))}
    </>
  )
}

;(DisplaySetupPreview as any).displayName = 'DisplaySetupPreview'
export default DisplaySetupPreview
