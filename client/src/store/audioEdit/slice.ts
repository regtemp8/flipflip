import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { Audio } from 'flipflip-common'

interface AudioEditState {
  ids?: number[]
  editing?: Partial<Audio>
}

export const initialState: AudioEditState = {}
export const audioEditSlice = createSlice({
  name: 'audioEdit',
  initialState,
  reducers: {
    setAudioEditEditing: (state, action: PayloadAction<Audio[]|undefined>) => {
      if(action.payload != null) {
        state.ids = action.payload.map((a) => a.id)

        state.editing = {}
        const keys = ["thumb", "name", "artist", "album", "comment", "trackNum"];
        for(const key of keys) {
          const values = new Set<string|number|boolean|number[]|undefined>()
          for(const audio of action.payload) {
            values.add(audio[key])
          }
          if(values.size === 1) {
            state.editing[key] = values.values().next().value
          }
        }
      } else {
        state.ids = undefined
        state.editing = undefined
      }
    },
    setAudioEditThumb: (state, action: PayloadAction<string|undefined>) => {
      if(state.editing != null) {
        state.editing.thumb = action.payload
      }
    },
    setAudioEditName: (state, action: PayloadAction<string>) => {
      if(state.editing != null) {
        state.editing.name = action.payload
      }
    },
    setAudioEditArtist: (state, action: PayloadAction<string>) => {
      if(state.editing != null) {
        state.editing.artist = action.payload
      }
    },
    setAudioEditAlbum: (state, action: PayloadAction<string>) => {
      if(state.editing != null) {
        state.editing.album = action.payload
      }
    },
    setAudioEditComment: (state, action: PayloadAction<string>) => {
      if(state.editing != null) {
        state.editing.comment = action.payload
      }
    },
    setAudioEditTrackNum: (state, action: PayloadAction<number>) => {
      if(state.editing != null) {
        state.editing.trackNum = action.payload
      }
    }
  }
})

export const {
  setAudioEditEditing, 
  setAudioEditThumb,
  setAudioEditName,
  setAudioEditArtist,
  setAudioEditAlbum,
  setAudioEditComment,
  setAudioEditTrackNum
} = audioEditSlice.actions
export default audioEditSlice.reducer
