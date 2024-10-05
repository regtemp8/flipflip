import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Credentials } from '../types/credentials'
import { Backup, SceneGroup, SceneGroupItem } from 'flipflip-common'

const tagTypes = [
  'Authenticated',
  'ConnectToken',
  'Backup',
  'Version',
  'GroupedScenes',
  'UngroupedScenes',
  'GroupedGenerators',
  'UngroupedGenerators',
  'GroupedDisplays',
  'UngroupedDisplays',
  'GroupedPlaylists',
  'UngroupedPlaylists'
]

export const flipflipApi = createApi({
  reducerPath: 'flipflipApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5050/',
    credentials: 'include'
  }),
  tagTypes,
  endpoints: (builder) => ({
    isAuthenticated: builder.query<boolean, void>({
      query: () => `authenticated`,
      providesTags: ['Authenticated']
    }),
    passwordLogin: builder.mutation<boolean, Credentials>({
      query(body) {
        return {
          url: `login/password`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['Authenticated']
    }),
    tokenLogin: builder.mutation<boolean, string>({
      query(token) {
        return {
          url: `login/token?token=${token}`
        }
      },
      invalidatesTags: ['Authenticated']
    }),
    logout: builder.mutation<boolean, void>({
      query() {
        return {
          url: `logout`
        }
      },
      invalidatesTags: ['Authenticated']
    }),
    getConnectToken: builder.query<string, void>({
      query: () => `connect`,
      providesTags: ['ConnectToken']
    }),
    getBackups: builder.query<Backup[], void>({
      query: () => `api/backups`,
      providesTags: [{ type: 'Backup', id: 'List' }]
    }),
    restoreBackup: builder.mutation<boolean, number>({
      query(id) {
        return {
          url: `api/backup/${id}/restore`,
          method: 'POST'
        }
      },
      invalidatesTags: tagTypes
    }),
    resetData: builder.mutation<boolean, void>({
      query() {
        return {
          url: `api/reset`,
          method: 'POST'
        }
      },
      invalidatesTags: tagTypes
    }),
    getVersion: builder.query<string, void>({
      query: () => `api/version`,
      providesTags: ['Version']
    }),
    getSceneGroups: builder.query<SceneGroup[], void>({
      query: () => `api/scenes/grouped`,
      providesTags: ['GroupedScenes']
    }),
    getUngroupedScenes: builder.query<SceneGroupItem[], void>({
      query: () => `api/scenes/ungrouped`,
      providesTags: ['UngroupedScenes']
    }),
    getGeneratorGroups: builder.query<SceneGroup[], void>({
      query: () => `api/generators/grouped`,
      providesTags: ['GroupedGenerators']
    }),
    getUngroupedGenerators: builder.query<SceneGroupItem[], void>({
      query: () => `api/generators/ungrouped`,
      providesTags: ['UngroupedGenerators']
    }),
    getDisplayGroups: builder.query<SceneGroup[], void>({
      query: () => `api/displays/grouped`,
      providesTags: ['GroupedDisplays']
    }),
    getUngroupedDisplays: builder.query<SceneGroupItem[], void>({
      query: () => `api/displays/ungrouped`,
      providesTags: ['UngroupedDisplays']
    }),
    getPlaylistGroups: builder.query<SceneGroup[], void>({
      query: () => `api/playlists/grouped`,
      providesTags: ['GroupedPlaylists']
    }),
    getUngroupedPlaylists: builder.query<SceneGroupItem[], void>({
      query: () => `api/playlists/ungrouped`,
      providesTags: ['UngroupedPlaylists']
    })
  })
})

export const {
  useIsAuthenticatedQuery,
  usePasswordLoginMutation,
  useTokenLoginMutation,
  useLogoutMutation,
  useGetConnectTokenQuery,
  useGetBackupsQuery,
  useRestoreBackupMutation,
  useResetDataMutation,
  useGetVersionQuery,
  useGetSceneGroupsQuery,
  useGetUngroupedScenesQuery,
  useGetGeneratorGroupsQuery,
  useGetUngroupedGeneratorsQuery,
  useGetDisplayGroupsQuery,
  useGetUngroupedDisplaysQuery,
  useGetPlaylistGroupsQuery,
  useGetUngroupedPlaylistsQuery
} = flipflipApi
