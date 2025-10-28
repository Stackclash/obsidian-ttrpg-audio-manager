import { App } from 'obsidian'
import AudioFile from './AudioFile'
import { PlaylistSettings } from '../types'
export default class AudioPlaylist {
  app: App
  name: string = ''
  loop: boolean = false
  private rawVolume: number = 0
  audioFiles: AudioFile[] = []

  constructor(app: App, name: string, audioPaths: string[], volume: number, loop: boolean) {
    this.app = app
    this.name = name
    this.loop = loop
    this.rawVolume = volume
    audioPaths.forEach(path => {
      this.audioFiles.push(new AudioFile(app, path, volume))
    })

    this.attachEndListeners()
  }

  private attachEndListeners() {
    this.audioFiles.forEach((audioFile, idx) => {
      audioFile.onEnded = () => this.handleTrackEnd(idx)
    })
  }

  private handleTrackEnd(idx: number) {
    if (idx < this.audioFiles.length - 1) {
      this.audioFiles[idx + 1].play()
    } else {
      if (this.loop) {
        this.audioFiles[0].play()
      } else {
        this.stop()
      }
    }
  }

  get state(): string {
    let state = 'stopped'

    this.audioFiles.forEach(audioFile => {
      if (audioFile.state !== 'stopped') state = audioFile.state
    })

    return state
  }

  set volume(volume: number) {
    this.audioFiles.forEach(audioFile => {
      audioFile.volume = volume
    })
    this.rawVolume = volume
  }

  get volume(): number {
    return this.rawVolume
  }

  getCurrentAudioIndex(): number {
    let index = 0

    this.audioFiles.forEach((audioFile, idx) => {
      if (audioFile.state !== 'stopped') index = idx
    })

    return index
  }

  async play(): Promise<void> {
    if (this.state === 'paused') {
      await this.audioFiles[this.getCurrentAudioIndex()].play()
    } else if (this.state === 'stopped') {
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
    this.audioFiles.push(new AudioFile(this.app, path, this.rawVolume, this.loop))
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
