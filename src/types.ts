export interface PlaylistSettings {
  name: string
  volume: number
  loop: boolean
  audioPaths: string[]
}

export interface SceneAudioSettings {
  audioPath: string
  volume: number
}

export interface SceneSettings {
  name: string
  audioSettings: SceneAudioSettings[]
}

export interface TtrpgAudioManagerSettings {
  audioFolders: string[]
  playlists: PlaylistSettings[]
  scenes: SceneSettings[]
}
