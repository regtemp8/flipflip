import { RootState } from '../store'

const getScenePickerFilters = (state: RootState) => state.scenePicker.filters
export const selectScenePickerFilters = () => {
  return getScenePickerFilters
}
