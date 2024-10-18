import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Credentials } from '../../data/Credentials'
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
  Tutorials,
  Tag,
  ContentSource,
  Clip,
  WeightGroup,
  Display,
  DisplayView,
  Playlist,
  DisplayPlaylistItem,
  ScenePlaylistItem,
  FontSettings,
  FontSettingsType,
  CaptionScript,
  Audio
} from 'flipflip-common'
import { SceneSelectOptionsRequest } from 'flipflip-common/src'

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
    getScenes: builder.query<number[], void>({
      query: () => `api/scenes`,
      providesTags: (scenes) =>
        scenes != null ? [{ type: 'Scene', id: 'List' }] : []
    }),
    getScene: builder.query<Scene, number>({
      query: (id) => `api/scenes/${id}`,
      providesTags: (scene) =>
        scene != null ? [{ type: 'Scene', id: scene.id }] : []
    }),
    getSceneWeightGroups: builder.query<WeightGroup[], number>({
      query: (id) => `api/scenes/${id}/weight-groups`,
      providesTags: (weightGroups, error, id) =>
        weightGroups != null ? [{ type: 'SceneWeightGroups', id }] : []
    }),
    getSceneScriptPlaylists: builder.query<string[], number>({
      query: (id) => `api/scenes/${id}/script-playlists`,
      providesTags: (playlists, error, id) =>
        playlists != null ? [{ type: 'SceneScriptPlaylists', id }] : []
    }),
    getSceneAudioPlaylists: builder.query<string[], number>({
      query: (id) => `api/scenes/${id}/audio-playlists`,
      providesTags: (playlists, error, id) =>
        playlists != null ? [{ type: 'SceneAudioPlaylists', id }] : []
    }),
    getSceneDisableWeightOptions: builder.query<boolean, number>({
      query: (id) => `api/scenes/${id}/disable-weight-options`,
      providesTags: (result, error, id) =>
        error == null ? [{ type: 'SceneDisableWeightOptions', id }] : []
    }),
    getSceneHasBPM: builder.query<boolean, number>({
      query: (id) => `api/scenes/${id}/has-bpm`,
      providesTags: (result, error, id) =>
        error == null ? [{ type: 'SceneHasBPM', id }] : []
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
    }),
    createScenePlaylist: builder.mutation<void, void>({
      query: () => ({
        url: `api/scene-playlists`,
        method: 'POST'
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          // TODO error handling needed?
        })
      }
    }),
    addSceneScriptPlaylist: builder.mutation<void, Pick<Scene, 'id'>>({
      query: ({ id }) => ({
        url: `api/scenes/${id}/script-playlists`,
        method: 'POST'
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          // TODO error handling needed?
        })
      }
    }),
    deleteSceneScriptPlaylist: builder.mutation<
      void,
      { sceneID: number; playlistID: number }
    >({
      query: ({ sceneID, playlistID }) => ({
        url: `api/scenes/${sceneID}/script-playlists/${playlistID}`,
        method: 'DELETE'
      }),
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          // TODO error handling needed?
        })
      }
    }),
    addSceneAudioPlaylist: builder.mutation<void, Pick<Scene, 'id'>>({
      query: ({ id }) => ({
        url: `api/scenes/${id}/audio-playlists`,
        method: 'POST'
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          // TODO error handling needed?
        })
      }
    }),
    deleteSceneAudioPlaylist: builder.mutation<
      void,
      { sceneID: number; playlistID: number }
    >({
      query: ({ sceneID, playlistID }) => ({
        url: `api/scenes/${sceneID}/audio-playlists/${playlistID}`,
        method: 'DELETE'
      }),
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          // TODO error handling needed?
        })
      }
    }),
    getTag: builder.query<Tag, number>({
      query: (id) => `api/tags/${id}`,
      providesTags: (tag) => (tag != null ? [{ type: 'Tag', id: tag.id }] : [])
    }),
    getClip: builder.query<Clip, number>({
      query: (id) => `api/clips/${id}`,
      providesTags: (clip) =>
        clip != null ? [{ type: 'Clip', id: clip.id }] : []
    }),
    updateClip: builder.mutation<void, Pick<Clip, 'id'> & Partial<Clip>>({
      query: ({ id, ...patch }) => ({
        url: `api/clips/${id}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags([{ type: 'Clip', id }]))
          }
        })
      }
    }),
    getContentSource: builder.query<ContentSource, number>({
      query: (id) => `api/content-sources/${id}`,
      providesTags: (source) =>
        source != null ? [{ type: 'ContentSource', id: source.id }] : []
    }),
    updateContentSource: builder.mutation<
      void,
      Pick<ContentSource, 'id'> & Partial<ContentSource>
    >({
      query: ({ id, ...patch }) => ({
        url: `api/content-sources/${id}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(
              flipflipApi.util.invalidateTags([{ type: 'ContentSource', id }])
            )
          }
        })
      }
    }),
    getDisplays: builder.query<number[], void>({
      query: () => `api/displays`,
      providesTags: (displays) =>
        displays != null ? [{ type: 'Display', id: 'List' }] : []
    }),
    getDisplay: builder.query<Display, number>({
      query: (id) => `api/displays/${id}`,
      providesTags: (display) =>
        display != null ? [{ type: 'Display', id: display.id }] : []
    }),
    updateDisplay: builder.mutation<
      void,
      Pick<Display, 'id'> & Partial<Display>
    >({
      query: ({ id, ...patch }) => ({
        url: `api/displays/${id}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags([{ type: 'Display', id }]))
          }
        })
      }
    }),
    getDisplayView: builder.query<DisplayView, number>({
      query: (id) => `api/display-views/${id}`,
      providesTags: (view) =>
        view != null ? [{ type: 'DisplayView', id: view.id }] : []
    }),
    updateDisplayView: builder.mutation<
      void,
      Pick<DisplayView, 'id'> & Partial<DisplayView>
    >({
      query: ({ id, ...patch }) => ({
        url: `api/display-views/${id}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(
              flipflipApi.util.invalidateTags([{ type: 'DisplayView', id }])
            )
          }
        })
      }
    }),
    getPlaylist: builder.query<Playlist, number>({
      query: (id) => `api/playlists/${id}`,
      providesTags: (view) =>
        view != null ? [{ type: 'Playlist', id: view.id }] : []
    }),
    updatePlaylist: builder.mutation<
      void,
      Pick<Playlist, 'id'> & Partial<Playlist>
    >({
      query: ({ id, ...patch }) => ({
        url: `api/playlists/${id}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(
              flipflipApi.util.invalidateTags([{ type: 'Playlist', id }])
            )
          }
        })
      }
    }),
    clonePlaylist: builder.mutation<void, number>({
      query: (id) => ({
        url: `api/playlists/${id}/clone`,
        method: 'POST'
      }),
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          // TODO error handling needed?
        })
      }
    }),
    deletePlaylist: builder.mutation<void, number>({
      query: (id) => ({
        url: `api/playlists/${id}`,
        method: 'DELETE'
      }),
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          // TODO error handling needed?
        })
      }
    }),
    getSceneSelectOptions: builder.query<
      Record<string, string>,
      SceneSelectOptionsRequest
    >({
      query: ({ includeExtra, includeRandom, onlyExtra }) => ({
        url: `api/scenes/select-options?includeExtra=${includeExtra}&includeRandom=${includeRandom}&onlyExtra=${onlyExtra}`
      }),
      providesTags: (result) => {
        // TODO incorporate request params into cache key
        return result != null ? ['SceneSelectOptions'] : []
      }
    }),
    getDisplaySelectOptions: builder.query<
      Record<string, string>,
      SceneSelectOptionsRequest
    >({
      query: ({ includeExtra, includeRandom, onlyExtra }) => ({
        url: `api/displays/select-options?includeExtra=${includeExtra}&includeRandom=${includeRandom}&onlyExtra=${onlyExtra}`
      }),
      providesTags: (result) => {
        // TODO incorporate request params into cache key
        return result != null ? ['DisplaySelectOptions'] : []
      }
    }),
    getDisplayPlaylistItem: builder.query<DisplayPlaylistItem, number>({
      query: (id) => ({
        url: `api/display-playlist-items/${id}`
      }),
      providesTags: (result) => {
        return result != null
          ? [{ type: 'DisplayPlaylistItems', id: result.id }]
          : []
      }
    }),
    getScenePlaylistItem: builder.query<ScenePlaylistItem, number>({
      query: (id) => ({
        url: `api/scene-playlist-items/${id}`
      }),
      providesTags: (result) => {
        return result != null
          ? [{ type: 'ScenePlaylistItems', id: result.id }]
          : []
      }
    }),
    getCaptionScript: builder.query<CaptionScript, number>({
      query: (id) => ({
        url: `api/caption-scripts/${id}`
      }),
      providesTags: (result) => {
        return result != null ? [{ type: 'CaptionScript', id: result.id }] : []
      }
    }),
    updateCaptionScript: builder.mutation<
      void,
      Pick<CaptionScript, 'id'> & Partial<CaptionScript>
    >({
      query: ({ id, ...patch }) => ({
        url: `api/caption-scripts/${id}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(
              flipflipApi.util.invalidateTags([{ type: 'CaptionScript', id }])
            )
          }
        })
      }
    }),
    getCaptionScriptFontSettings: builder.query<
      FontSettings,
      { id: number; type: FontSettingsType }
    >({
      query: ({ id, type }) => ({
        url: `api/caption-scripts/${id}/font-settings/${type}`
      }),
      providesTags: (result, error, { id, type }) => {
        return result != null
          ? [{ type: 'CaptionScriptFontSettings', id: `${id}:${type}` }]
          : []
      }
    }),
    updateCaptionScriptFontSettings: builder.mutation<
      void,
      { id: number; type: FontSettingsType } & Partial<FontSettings>
    >({
      query: ({ id, type, ...patch }) => ({
        url: `api/caption-scripts/${id}/font-settings/${type}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id, type }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(
              flipflipApi.util.invalidateTags([
                { type: 'CaptionScriptFontSettings', id: `${id}:${type}` }
              ])
            )
          }
        })
      }
    }),
    getAudio: builder.query<Audio, number>({
      query: (id) => ({
        url: `api/audios/${id}`
      }),
      providesTags: (result) => {
        return result != null ? [{ type: 'Audio', id: result.id }] : []
      }
    }),
    updateAudio: builder.mutation<void, Pick<Audio, 'id'> & Partial<Audio>>({
      query: ({ id, ...patch }) => ({
        url: `api/audios/${id}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags([{ type: 'Audio', id }]))
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
  useGetScenesQuery,
  useGetSceneQuery,
  useGetSceneWeightGroupsQuery,
  useGetSceneScriptPlaylistsQuery,
  useGetSceneAudioPlaylistsQuery,
  useGetSceneDisableWeightOptionsQuery,
  useGetSceneHasBPMQuery,
  useUpdateSceneMutation,
  useGetSceneSettingsQuery,
  useAddSceneScriptPlaylistMutation,
  useDeleteSceneScriptPlaylistMutation,
  useAddSceneAudioPlaylistMutation,
  useDeleteSceneAudioPlaylistMutation,
  useGetTagQuery,
  useGetClipQuery,
  useUpdateClipMutation,
  useGetContentSourceQuery,
  useUpdateContentSourceMutation,
  useGetDisplaysQuery,
  useGetDisplayQuery,
  useUpdateDisplayMutation,
  useGetDisplayViewQuery,
  useCreateScenePlaylistMutation,
  useGetPlaylistQuery,
  useUpdatePlaylistMutation,
  useClonePlaylistMutation,
  useDeletePlaylistMutation,
  useGetSceneSelectOptionsQuery,
  useGetDisplaySelectOptionsQuery,
  useGetDisplayPlaylistItemQuery,
  useGetScenePlaylistItemQuery,
  useGetCaptionScriptQuery,
  useUpdateCaptionScriptMutation,
  useGetCaptionScriptFontSettingsQuery,
  useUpdateCaptionScriptFontSettingsMutation,
  useGetAudioQuery,
  useUpdateAudioMutation
} = flipflipApi
