export type ImagePlayerDataPlaylistItem = {
    scenes: number[],
    duration: number
}

export type ImagePlayerDataPlaylist = {
    id: number
    shuffle: boolean
    repeat: string
    items: ImagePlayerDataPlaylistItem[]
}

export type ImagePlayerData = {
  displayViewId: number
  maxCanLoad: number
  playlist: ImagePlayerDataPlaylist
}