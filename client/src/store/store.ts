import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { flipflipApi } from './api/slice'
import systemSnackSlice from './systemSnack/store'
import scenePickerSlice from './scenePicker/slice'

const store = configureStore({
  reducer: {
    [flipflipApi.reducerPath]: flipflipApi.reducer,
    // components
    scenePicker: scenePickerSlice,
    systemSnack: systemSnackSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(flipflipApi.middleware)
})

setupListeners(store.dispatch)

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
