import { App } from 'obsidian'
import AudioFile from './AudioFile'
import { PlaylistSettings } from '../types'

export default class AudioPlaylist {
  app: App
  name: string = ''
  volume: number = 0
  loop: boolean = false
  audioFiles: AudioFile[] = []

  constructor(app: App, name: string, audioPaths: string[], volume: number, loop: boolean) {
    this.app = app
    this.name = name
    this.volume = volume
    this.loop = loop
    audioPaths.forEach(path => {
      this.audioFiles.push(new AudioFile(app, path, volume))
    })
  }

  // Maybe also pass back what file currently on
  get state(): string {
    this.audioFiles.forEach(audioFile => {
      if (audioFile.state !== 'stopped') return audioFile.state
    })

    return 'stopped'
  }

  getCurrentAudio(): number | null {
    this.audioFiles.forEach((audioFile, index) => {
      if (audioFile.state !== 'stopped') return index
    })

    return null
  }

  async play(): Promise<void> {
    if (this.state === 'paused') {
      const audioIndex = this.getCurrentAudio()
      if (audioIndex) await this.audioFiles[audioIndex].play()
    } else if (this.state === 'stopped') {
      console.log(this.audioFiles)
      await this.audioFiles[0].play()
    }
  }

  pause(): void {
    this.audioFiles.forEach(audioFile => {
      if (audioFile.state === 'playing') audioFile.pause()
    })
  }

  stop(): void {
    this.audioFiles.forEach(audioFile => {
      if (audioFile.state === 'playing') audioFile.stop()
    })
  }

  addAudioFile(path: string): void {
    this.audioFiles.push(new AudioFile(this.app, path, this.volume, this.loop))
  }

  removeAudioFileByPath(path: string): void {
    this.audioFiles = this.audioFiles.filter(audioFile => audioFile.path !== path)
  }

  removeAudioFileByIndex(index: number): void {
    if (index >= 0 && index < this.audioFiles.length) {
      this.audioFiles.splice(index, 1)
    }
  }

  toJson(): PlaylistSettings {
    return {
      name: this.name,
      volume: this.volume,
      loop: this.loop,
      audioPaths: this.audioFiles.map(f => f.path),
    }
  }
}
