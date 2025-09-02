import { useGetVisibleDisplayViewIdsQuery } from '../../store/api/slice'
import DisplayViewBox from './DisplayViewBox'

export interface DisplaySetupPreviewProps {
  displayID: number
  selectedView?: number
}

function DisplaySetupPreview(props: DisplaySetupPreviewProps) {
  const { data: views } = useGetVisibleDisplayViewIdsQuery(props.displayID)
  return (
    <>
      {views?.map((id) => (
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
