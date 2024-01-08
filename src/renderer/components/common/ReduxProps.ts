import { type RootState } from '../../../store/store'

export default interface ReduxProps<T> {
  selector: (state: RootState) => T
  action: (value: T) => any
}
