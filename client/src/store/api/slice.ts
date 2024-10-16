import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import debounce from 'debounce'
import { Credentials } from '../../types/credentials'
import {
  AccountChange,
  Backup,
  CacheSettings,
  DisplaySettings,
  GeneralSettings,
  Message,
  RemoteSettings,
  Scene,
  SceneGroup,
  SceneGroupItem,
  ThemeSettings,
  Tutorials
} from 'flipflip-common'

// TODO check all tag types, you've added new ones
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
  'UngroupedPlaylists',
  'Tutorials',
  'Config',
  'Scene'
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
    changeUsername: builder.mutation<Message, AccountChange>({
      query(body) {
        return {
          url: `change-username`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: (result, error) =>
        error == null ? ['Authenticated'] : []
    }),
    changePassword: builder.mutation<Message, AccountChange>({
      query(body) {
        return {
          url: `change-password`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: (result, error) =>
        error == null ? ['Authenticated'] : []
    }),
    getConnectToken: builder.query<string, void>({
      query: () => `connect`,
      providesTags: ['ConnectToken']
    }),
    getBackups: builder.query<Backup[], void>({
      query: () => `api/backups`,
      providesTags: [{ type: 'Backup', id: 'List' }]
    }),
    createBackup: builder.mutation<boolean, void>({
      query() {
        return {
          url: `api/backups/new`,
          method: 'POST'
        }
      },
      invalidatesTags: [{ type: 'Backup', id: 'List' }]
    }),
    cleanBackups: builder.mutation<boolean, void>({
      query() {
        return {
          url: `api/backups/clean`,
          method: 'POST'
        }
      },
      invalidatesTags: [{ type: 'Backup', id: 'List' }]
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
    getVersion: builder.query<Message, void>({
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
    }),
    getPlaylistOptions: builder.query<SceneGroupItem[], string>({
      query: (type: string) => `api/playlists/options/${type}`,
      providesTags: (result, error, type) =>
        result != null ? [{ type: 'PlaylistOptions', id: type }] : []
    }),
    getTutorials: builder.query<Tutorials, void>({
      query: () => `api/tutorials`,
      providesTags: ['Tutorials']
    }),
    getTheme: builder.query<ThemeSettings, void>({
      query: () => `api/settings/theme`,
      providesTags: ['Theme']
    }),
    updateTheme: builder.mutation<void, Partial<ThemeSettings>>({
      query(body) {
        return {
          url: `api/settings/theme`,
          method: 'PATCH',
          body
        }
      },
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags(['Theme']))
          }
        })
      }
    }),
    getGeneralSettings: builder.query<GeneralSettings, void>({
      query: () => `api/settings/general`,
      providesTags: ['GeneralSettings']
    }),
    updateGeneralSettings: builder.mutation<void, Partial<GeneralSettings>>({
      query(body) {
        return {
          url: `api/settings/general`,
          method: 'PATCH',
          body
        }
      },
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags(['GeneralSettings']))
          }
        })
      }
    }),
    getRemoteSettings: builder.query<RemoteSettings, void>({
      query: () => `api/settings/remote`,
      providesTags: ['RemoteSettings']
    }),
    updateRemoteSettings: builder.mutation<void, Partial<RemoteSettings>>({
      query(body) {
        return {
          url: `api/settings/remote`,
          method: 'PATCH',
          body
        }
      },
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags(['RemoteSettings']))
          }
        })
      }
    }),
    getDisplaySettings: builder.query<DisplaySettings, void>({
      query: () => `api/settings/display`,
      providesTags: ['DisplaySettings']
    }),
    updateDisplaySettings: builder.mutation<void, Partial<DisplaySettings>>({
      query(body) {
        return {
          url: `api/settings/display`,
          method: 'PATCH',
          body
        }
      },
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags(['DisplaySettings']))
          }
        })
      }
    }),
    getCacheSettings: builder.query<CacheSettings, void>({
      query: () => `api/settings/cache`,
      providesTags: ['CacheSettings']
    }),
    updateCacheSettings: builder.mutation<void, Partial<CacheSettings>>({
      query(body) {
        return {
          url: `api/settings/cache`,
          method: 'PATCH',
          body
        }
      },
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags(['CacheSettings']))
          }
        })
      }
    }),
    resetTutorials: builder.mutation<boolean, void>({
      query() {
        return {
          url: `api/tutorials/reset`,
          method: 'POST'
        }
      },
      invalidatesTags: ['Tutorials']
    }),
    getSystemFonts: builder.query<string[], void>({
      query: () => `api/system-fonts`,
      providesTags: ['SystemFonts']
    }),
    defaultConfig: builder.mutation<boolean, void>({
      query() {
        return {
          url: `api/config/default`,
          method: 'POST'
        }
      },
      invalidatesTags: ['Config']
    }),
    getScene: builder.query<Scene, number>({
      query: (id) => `api/scenes/${id}`,
      providesTags: (scene) =>
        scene != null ? [{ type: 'Scene', id: scene.id }] : []
    }),
    getSceneDisableWeightOptions: builder.query<boolean, number>({
      query: (id) => `api/scenes/${id}/disable-weight-options`,
      providesTags: (result, error, id) =>
        error == null ? [{ type: 'SceneDisableWeightOptions', id }] : []
    }),
    getSceneHasBPM: builder.query<boolean, number>({
      query: (id) => `api/scenes/${id}/has-bpm`,
      providesTags: (result, error, id) =>
        error == null ? [{ type: 'SceneDisableWeightOptions', id }] : []
    }),
    getSceneSettings: builder.query<Scene, void>({
      query: () => `api/scenes/default`,
      providesTags: (scene) =>
        scene != null ? [{ type: 'Scene', id: scene.id }] : []
    }),
    updateScene: builder.mutation<void, Pick<Scene, 'id'> & Partial<Scene>>({
      query: ({ id, ...patch }) => ({
        url: `api/scenes/${id}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags([{ type: 'Scene', id }]))
          }
        })
      }
    })
  })
})

export const {
  useIsAuthenticatedQuery,
  usePasswordLoginMutation,
  useTokenLoginMutation,
  useLogoutMutation,
  useChangeUsernameMutation,
  useChangePasswordMutation,
  useGetConnectTokenQuery,
  useGetBackupsQuery,
  useCreateBackupMutation,
  useCleanBackupsMutation,
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
  useGetUngroupedPlaylistsQuery,
  useGetPlaylistOptionsQuery,
  useGetTutorialsQuery,
  useGetThemeQuery,
  useUpdateThemeMutation,
  useGetGeneralSettingsQuery,
  useUpdateGeneralSettingsMutation,
  useGetRemoteSettingsQuery,
  useUpdateRemoteSettingsMutation,
  useGetDisplaySettingsQuery,
  useUpdateDisplaySettingsMutation,
  useGetCacheSettingsQuery,
  useUpdateCacheSettingsMutation,
  useResetTutorialsMutation,
  useGetSystemFontsQuery,
  useDefaultConfigMutation,
  useGetSceneQuery,
  useGetSceneDisableWeightOptionsQuery,
  useGetSceneHasBPMQuery,
  useUpdateSceneMutation,
  useGetSceneSettingsQuery
} = flipflipApi
