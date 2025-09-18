import AudioFile from './AudioFile'
import { SceneAudioSettings, SceneSettings } from '../types'
import { App } from 'obsidian'

export default class AudioScene {
  app: App
  name: string = ''
  audioFiles: AudioFile[] = []

  constructor(app: App, name: string, audioSettings: SceneAudioSettings[]) {
    this.app = app
    this.name = name
    audioSettings.forEach(setting => {
      this.audioFiles.push(new AudioFile(app, setting.audioPath, setting.volume, true))
    })
  }

  get state(): string {
    if (this.audioFiles.length === 0) return 'stopped'
    const state = this.audioFiles[0].state
    return this.audioFiles.every(audioFile => state === audioFile.state) ? state : ''
  }

  async play(): Promise<void> {
    if (this.state !== 'playing') {
      await Promise.all(this.audioFiles.map(audioFile => audioFile.play()))
    }
  }

  pause(): void {
    this.audioFiles.forEach(audioFile => {
      if (audioFile.state === 'playing') {
        audioFile.pause()
      }
    })
  }

  stop(): void {
    this.audioFiles.forEach(audioFile => {
      audioFile.stop()
    })
  }

  addAudioFile(path: string, volume: number): void {
    this.audioFiles.push(new AudioFile(this.app, path, volume))
  }

  removeAudioFileByPath(path: string): void {
    // console.log(this.audioFiles.map(f => f.path))
    this.audioFiles = this.audioFiles.filter(audioFile => audioFile.path !== path)
  }

  removeAudioFileByIndex(index: number): void {
    if (index >= 0 && index < this.audioFiles.length) {
      this.audioFiles.splice(index, 1)
    }
  }

  toJson(): SceneSettings {
    return {
      name: this.name,
      audioSettings: this.audioFiles.map(f => ({
        audioPath: f.path,
        volume: f.volume,
      })),
    }
  }
}
