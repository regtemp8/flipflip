import { AppDispatch } from '../../store/store'

export default interface ReduxProps<T, S = T> {
  selector: () => { data?: S }
  action: (value: T) => (dispatch: AppDispatch) => void
}
