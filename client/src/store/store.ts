/// <reference path="../global.d.ts"/>
import { createReduxStore } from '../server/renderer'

const store = createReduxStore(
  window.flipflipAppStorage,
  window.flipflipConstants
)

export default store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
