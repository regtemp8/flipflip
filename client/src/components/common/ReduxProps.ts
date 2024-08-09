import { AnyAction } from 'redux'
import { type RootState } from '../../store/store'

export default interface ReduxProps<T, S = T> {
  selector: (state: RootState) => S
  action: (value: T) => AnyAction
}
