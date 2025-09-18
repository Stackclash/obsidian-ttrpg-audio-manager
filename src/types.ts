export type AudioFolderSettings = string[]

export type PlaylistSettings = {
  name: string
  volume: number
  loop: boolean
  audioPaths: string[]
}

export type SceneAudioSettings = {
  audioPath: string
  volume: number
}

export type SceneSettings = {
  name: string
  audioSettings: SceneAudioSettings[]
}

export type TtrpgAudioManagerSettings = {
  audioFolders: AudioFolderSettings
  playlists: PlaylistSettings[]
  scenes: SceneSettings[]
}
