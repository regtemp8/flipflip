import {
  createApi,
  fetchBaseQuery,
  TagDescription
} from '@reduxjs/toolkit/query/react'
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
  Audio,
  FilePickerData,
  CleanBackupsRequest,
  CacheSize,
  SortRequest,
  MoveRequest,
  SelectOption,
  BatchTagRequest,
  AudioSortRequest,
  ContentSortRequest
} from 'flipflip-common'
import { SceneSelectOptionsRequest } from 'flipflip-common/src'

export const flipflipApi = createApi({
  reducerPath: 'flipflipApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5050/',
    credentials: 'include'
  }),
  tagTypes: [
    'Authenticated',
    'Theme',
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
    'PlaylistOptions',
    'Tutorials',
    'GeneralSettings',
    'RemoteSettings',
    'DisplaySettings',
    'CacheSettings',
    'CacheSize',
    'IgnoredTags',
    'SystemFonts',
    'Config',
    'Scene',
    'SceneWeightGroups',
    'SceneAudioPlaylists',
    'SceneScriptPlaylists',
    'SceneDisableWeightOptions',
    'SceneHasBPM',
    'Tag',
    'Clip',
    'ContentSource',
    'ContentSourceBatchTagOptions',
    'Display',
    'DisplayView',
    'Playlist',
    'SceneSelectOptions',
    'DisplaySelectOptions',
    'DisplayPlaylistItems',
    'ScenePlaylistItems',
    'CaptionScript',
    'CaptionScriptFontSettings',
    'CaptionScriptBatchTagOptions',
    'Audio',
    'AudioBatchTagOptions',
    'FilePicker',
    'CaptionScriptSearchOptions',
    'AudioSearchOptions',
    'ContentSourceSearchOptions',
    'TagSearchOptions',
    'IgnoredTagOptions'
  ],
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
      invalidatesTags: ['Authenticated', 'Theme']
    }),
    tokenLogin: builder.mutation<boolean, string>({
      query(token) {
        return {
          url: `login/token?token=${token}`
        }
      },
      invalidatesTags: ['Authenticated', 'Theme']
    }),
    logout: builder.mutation<boolean, void>({
      query() {
        return {
          url: `logout`
        }
      },
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(flipflipApi.util.resetApiState())
      }
    }),
    changeUsername: builder.mutation<Message, AccountChange>({
      query(body) {
        return {
          url: `change-username`,
          method: 'POST',
          body
        }
      },
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(flipflipApi.util.resetApiState())
      }
    }),
    changePassword: builder.mutation<Message, AccountChange>({
      query(body) {
        return {
          url: `change-password`,
          method: 'POST',
          body
        }
      },
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(flipflipApi.util.resetApiState())
      }
    }),
    getConnectToken: builder.query<string, void>({
      query: () => `connect`,
      providesTags: ['ConnectToken']
    }),
    getBackups: builder.query<Backup[], void>({
      query: () => `api/backups`,
      providesTags: [{ type: 'Backup', id: 'List' }]
    }),
    createBackup: builder.mutation<Message, void>({
      query() {
        return {
          url: `api/backups`,
          method: 'POST'
        }
      },
      invalidatesTags: [{ type: 'Backup', id: 'List' }]
    }),
    cleanBackups: builder.mutation<Message, CleanBackupsRequest>({
      query(body) {
        return {
          url: `api/backups/clean`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: [{ type: 'Backup', id: 'List' }]
    }),
    restoreBackup: builder.mutation<Message, number>({
      query(id) {
        return {
          url: `api/backups/${id}/restore`,
          method: 'POST'
        }
      },
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(flipflipApi.util.resetApiState())
      }
    }),
    resetData: builder.mutation<boolean, void>({
      query() {
        return {
          url: `api/reset`,
          method: 'POST'
        }
      },
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(flipflipApi.util.resetApiState())
      }
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
    getCacheSize: builder.query<CacheSize, void>({
      query: () => `api/settings/cache/size`,
      providesTags: ['CacheSize']
    }),
    clearCache: builder.mutation<void, void>({
      query: () => ({ url: `api/settings/cache/clear`, method: 'POST' }),
      invalidatesTags: ['CacheSize']
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
        await queryFulfilled
          .then(async (reason) => {
            if (!reason.meta?.response?.ok) {
              return
            }

            const json = await reason.meta.request.json()
            if (json.directory != null) {
              dispatch(flipflipApi.util.invalidateTags(['CacheSize']))
            }
          })
          .catch((reason) => {
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
    resetSettings: builder.mutation<boolean, void>({
      query() {
        return {
          url: `api/settings/reset`,
          method: 'POST'
        }
      },
      invalidatesTags: [
        'Theme',
        'CacheSize',
        'CacheSettings',
        'DisplaySettings',
        'IgnoredTags',
        'GeneralSettings',
        'RemoteSettings'
      ]
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
    getTags: builder.query<number[], void>({
      query: () => `api/tags`,
      providesTags: (tags) =>
        tags != null ? [{ type: 'Tag', id: 'List' }] : []
    }),
    deleteTags: builder.mutation<void, void>({
      query: () => ({
        url: `api/tags`,
        method: 'DELETE'
      }),
      async onQueryStarted(res, { dispatch, queryFulfilled }) {
        await queryFulfilled.then(({ meta }) => {
          if (meta?.response?.ok) {
            dispatch(flipflipApi.util.invalidateTags(['Tag']))
          }
        })
      }
    }),
    getTagsCount: builder.query<number, void>({
      query: () => `api/tags/count`,
      providesTags: (count) =>
        count != null ? [{ type: 'Tag', id: 'Count' }] : []
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
    sortContentSources: builder.mutation<void, ContentSortRequest>({
      query: (body) => ({
        url: `api/content-sources/sort`,
        method: 'POST',
        body
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  { type: 'ContentSource', id: 'List' },
                  { type: 'ContentSource', id: 'FilteredList' }
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
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
    createCaptionScripts: builder.mutation<void, string[]>({
      query: (body) => ({
        url: `api/caption-scripts`,
        method: 'POST',
        body
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  { type: 'CaptionScript', id: 'List' },
                  { type: 'CaptionScript', id: 'FilteredList' }
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    getCaptionScripts: builder.query<number[], void>({
      query: () => ({
        url: `api/caption-scripts`
      }),
      providesTags: [{ type: 'CaptionScript', id: 'List' }]
    }),
    getFilteredCaptionScripts: builder.query<number[], string[]>({
      query: (filters) => {
        let filtersQuery = encodeURIComponent(filters.join(','))
        if (filtersQuery !== '') {
          filtersQuery = '?filters=' + filtersQuery
        }

        // TODO would it be better to do filtering on the client?
        return { url: `api/caption-scripts/filtered${filtersQuery}` }
      },
      providesTags: [{ type: 'CaptionScript', id: 'FilteredList' }]
    }),
    getCaptionScript: builder.query<CaptionScript, number>({
      query: (id) => ({
        url: `api/caption-scripts/${id}`
      }),
      providesTags: (result) => {
        return result != null ? [{ type: 'CaptionScript', id: result.id }] : []
      }
    }),
    deleteCaptionScript: builder.mutation<void, Pick<CaptionScript, 'id'>>({
      query: ({ id }) => ({
        url: `api/caption-scripts/${id}`,
        method: 'DELETE'
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.then(({ meta }) => {
          if (meta?.response?.ok) {
            dispatch(
              flipflipApi.util.invalidateTags([{ type: 'CaptionScript', id }])
            )
          }
        })
      }
    }),
    deleteCaptionScripts: builder.mutation<void, number[] | undefined>({
      query: (ids) => ({
        url: `api/caption-scripts`,
        method: 'DELETE',
        body: { ids }
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled.then(({ meta }) => {
          if (meta?.response?.ok) {
            dispatch(
              flipflipApi.util.invalidateTags([{ type: 'CaptionScript' }])
            )
          }
        })
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
        await queryFulfilled
          .then(({ meta }) => {
            const status = meta?.response?.status
            if (status === 205) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  { type: 'CaptionScript', id },
                  { type: 'CaptionScript', id: 'FilteredList' },
                  { type: 'CaptionScript', id: 'List' }
                ])
              )
            }
          })
          .catch((reason) => {
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
    getCaptionScriptBatchTagOptions: builder.query<SelectOption[], void>({
      query: () => ({
        url: `api/caption-scripts/batch-tag-options`
      }),
      providesTags: (result) => {
        return result != null ? ['CaptionScriptBatchTagOptions'] : []
      }
    }),
    getAudioBatchTagOptions: builder.query<SelectOption[], void>({
      query: () => ({
        url: `api/audios/batch-tag-options`
      }),
      providesTags: (result) => {
        return result != null ? ['AudioBatchTagOptions'] : []
      }
    }),
    getContentSourceBatchTagOptions: builder.query<SelectOption[], void>({
      query: () => ({
        url: `api/content-sources/batch-tag-options`
      }),
      providesTags: (result) => {
        return result != null ? ['ContentSourceBatchTagOptions'] : []
      }
    }),
    getCaptionScriptSearchOptions: builder.query<SelectOption[], void>({
      query: () => ({
        url: `api/caption-scripts/search-options`
      }),
      providesTags: (result) => {
        return result != null ? ['CaptionScriptSearchOptions'] : []
      }
    }),
    getAudioSearchOptions: builder.query<SelectOption[], void>({
      query: () => ({
        url: `api/audios/search-options`
      }),
      providesTags: (result) => {
        return result != null ? ['AudioSearchOptions'] : []
      }
    }),
    getContentSourceSearchOptions: builder.query<SelectOption[], void>({
      query: () => ({
        url: `api/content-sources/search-options`
      }),
      providesTags: (result) => {
        return result != null ? ['ContentSourceSearchOptions'] : []
      }
    }),
    getTagSearchOptions: builder.query<SelectOption[], void>({
      query: () => ({
        url: `api/tags/search-options`
      }),
      providesTags: (result) => {
        return result != null ? ['TagSearchOptions'] : []
      }
    }),
    batchTagAudios: builder.mutation<void, BatchTagRequest>({
      query(body) {
        return {
          url: `api/audios/tags`,
          method: 'POST',
          body
        }
      },
      async onQueryStarted(request, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  ...request.ids.map((id) => ({ type: 'Audio' as const, id })),
                  'AudioBatchTagOptions',
                  'AudioSearchOptions'
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    batchTagContentSources: builder.mutation<void, BatchTagRequest>({
      query(body) {
        return {
          url: `api/content-sources/tags`,
          method: 'POST',
          body
        }
      },
      async onQueryStarted(request, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  ...request.ids.map((id) => ({
                    type: 'ContentSource' as const,
                    id
                  })),
                  'ContentSourceBatchTagOptions',
                  'IgnoredTagOptions',
                  'ContentSourceSearchOptions'
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    batchTagCaptionScripts: builder.mutation<void, BatchTagRequest>({
      query(body) {
        return {
          url: `api/caption-scripts/tags`,
          method: 'POST',
          body
        }
      },
      async onQueryStarted(request, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  ...request.ids.map((id) => ({
                    type: 'CaptionScript' as const,
                    id
                  })),
                  'CaptionScriptBatchTagOptions',
                  'CaptionScriptSearchOptions'
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    markAudios: builder.mutation<void, number[]>({
      query(body) {
        return {
          url: `api/audios/mark`,
          method: 'POST',
          body
        }
      },
      async onQueryStarted(ids, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  ...ids.map((id) => ({ type: 'Audio' as const, id })),
                  'AudioSearchOptions'
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    markContentSources: builder.mutation<void, number[]>({
      query(body) {
        return {
          url: `api/content-sources/mark`,
          method: 'POST',
          body
        }
      },
      async onQueryStarted(ids, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  ...ids.map((id) => ({ type: 'ContentSource' as const, id })),
                  'ContentSourceSearchOptions'
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    markCaptionScripts: builder.mutation<void, number[]>({
      query(body) {
        return {
          url: `api/caption-scripts/mark`,
          method: 'POST',
          body
        }
      },
      async onQueryStarted(ids, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  ...ids.map((id) => ({ type: 'CaptionScript' as const, id })),
                  'CaptionScriptSearchOptions'
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    sortCaptionScripts: builder.mutation<void, SortRequest>({
      query: (body) => ({
        url: `api/caption-scripts/sort`,
        method: 'POST',
        body
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  { type: 'CaptionScript', id: 'List' },
                  { type: 'CaptionScript', id: 'FilteredList' }
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    moveCaptionScript: builder.mutation<void, MoveRequest>({
      query: (body) => ({
        url: `api/caption-scripts/move`,
        method: 'POST',
        body
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(
              flipflipApi.util.invalidateTags([
                { type: 'CaptionScript', id: 'List' },
                { type: 'CaptionScript', id: 'FilteredList' }
              ])
            )
          }
        })
      }
    }),
    createAudios: builder.mutation<void, string[]>({
      query: (body) => ({
        url: `api/audios`,
        method: 'POST',
        body
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  { type: 'Audio', id: 'List' },
                  { type: 'Audio', id: 'FilteredList' }
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    getAudios: builder.query<number[], void>({
      query: () => ({
        url: `api/audios`
      }),
      providesTags: [{ type: 'Audio', id: 'List' }]
    }),
    getFilteredAudios: builder.query<number[], string[]>({
      query: (filters) => {
        let filtersQuery = encodeURIComponent(filters.join(','))
        if (filtersQuery !== '') {
          filtersQuery = '?filters=' + filtersQuery
        }

        // TODO would it be better to do filtering on the client?
        return { url: `api/audios/filtered${filtersQuery}` }
      },
      providesTags: [{ type: 'Audio', id: 'FilteredList' }]
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
    }),
    uploadAudioThumb: builder.mutation<Pick<Audio, 'thumb'>, Pick<Audio, 'thumb'>>({
      query: ({ thumb }) => ({
        url: `api/audios/upload-thumb`,
        method: 'POST',
        body: {thumb}
      })
    }),
    sortAudios: builder.mutation<void, AudioSortRequest>({
      query: (body) => ({
        url: `api/audios/sort`,
        method: 'POST',
        body
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  { type: 'Audio', id: 'List' },
                  { type: 'Audio', id: 'FilteredList' }
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    sortTags: builder.mutation<void, SortRequest>({
      query: (body) => ({
        url: `api/tags/sort`,
        method: 'POST',
        body
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([{ type: 'Tag', id: 'List' }])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    createTag: builder.mutation<void, Omit<Tag, 'id'>>({
      query: (body) => ({
        url: `api/tags`,
        method: 'POST',
        body
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled
          .then(({ meta }) => {
            if (meta?.response?.ok) {
              dispatch(
                flipflipApi.util.invalidateTags([
                  { type: 'Tag', id: 'List' },
                  { type: 'CaptionScriptBatchTagOptions' },
                  { type: 'ContentSourceBatchTagOptions' },
                  { type: 'AudioBatchTagOptions' }
                ])
              )
            }
          })
          .catch((reason) => {
            // TODO error handling needed?
          })
      }
    }),
    moveTag: builder.mutation<void, MoveRequest>({
      query: (body) => ({
        url: `api/tags/move`,
        method: 'POST',
        body
      }),
      async onQueryStarted(v, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(
              flipflipApi.util.invalidateTags([{ type: 'Tag', id: 'List' }])
            )
          }
        })
      }
    }),
    updateTag: builder.mutation<void, Pick<Tag, 'id'> & Partial<Tag>>({
      query: ({ id, ...patch }) => ({
        url: `api/tags/${id}`,
        method: 'PATCH',
        body: patch
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch((reason) => {
          const status = reason.meta?.response?.status
          // TODO implement etags (412)
          // TODO implement userId checks (403)
          if (status === 412 || status === 403) {
            dispatch(flipflipApi.util.invalidateTags([{ type: 'Tag', id }]))
          }
        })
      }
    }),
    deleteTag: builder.mutation<void, Pick<Tag, 'id'>>({
      query: ({ id }) => ({
        url: `api/tags/${id}`,
        method: 'DELETE'
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await queryFulfilled.then(({ meta }) => {
          if (meta?.response?.ok) {
            dispatch(
              flipflipApi.util.invalidateTags([
                { type: 'Tag', id },
                { type: 'Tag', id: 'List' }
              ])
            )
          }
        })
      }
    }),
    getFilePickerData: builder.query<
      FilePickerData,
      { path?: string; type?: string }
    >({
      query: (data) => ({
        url: `fs/pick/${data.path ?? ''}${data.type ? '?type=' + data.type : ''}`
      }),
      providesTags: ['FilePicker']
    }),
    createDirectory: builder.mutation<void, { path: string }>({
      query: (body) => ({
        url: `fs/create-directory`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['FilePicker']
    })
  })
})

export const {
  useGetFilePickerDataQuery,
  useCreateDirectoryMutation,
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
  useGetCacheSizeQuery,
  useClearCacheMutation,
  useGetCacheSettingsQuery,
  useUpdateCacheSettingsMutation,
  useResetTutorialsMutation,
  useResetSettingsMutation,
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
  useSortContentSourcesMutation,
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
  useDeleteCaptionScriptsMutation,
  useUpdateCaptionScriptMutation,
  useGetCaptionScriptFontSettingsQuery,
  useUpdateCaptionScriptFontSettingsMutation,
  useCreateAudiosMutation,
  useGetAudiosQuery,
  useGetFilteredAudiosQuery,
  useGetAudioQuery,
  useUpdateAudioMutation,
  useUploadAudioThumbMutation,
  useSortAudiosMutation,
  useGetTagsQuery,
  useDeleteTagsMutation,
  useGetTagsCountQuery,
  useCreateCaptionScriptsMutation,
  useGetCaptionScriptsQuery,
  useDeleteCaptionScriptMutation,
  useGetFilteredCaptionScriptsQuery,
  useSortCaptionScriptsMutation,
  useMoveCaptionScriptMutation,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useSortTagsMutation,
  useMoveTagMutation,
  useGetCaptionScriptBatchTagOptionsQuery,
  useGetAudioBatchTagOptionsQuery,
  useGetContentSourceBatchTagOptionsQuery,
  useGetCaptionScriptSearchOptionsQuery,
  useGetAudioSearchOptionsQuery,
  useGetContentSourceSearchOptionsQuery,
  useGetTagSearchOptionsQuery,
  useBatchTagAudiosMutation,
  useBatchTagContentSourcesMutation,
  useBatchTagCaptionScriptsMutation,
  useMarkAudiosMutation,
  useMarkCaptionScriptsMutation,
  useMarkContentSourcesMutation
} = flipflipApi
