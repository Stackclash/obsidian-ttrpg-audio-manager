import { App } from 'obsidian'
import { fileExists, getFullPath, readFile } from '../utils/fileUtils'

type AudioState = 'playing' | 'paused' | 'stopped'

export default class AudioFile {
  app: App
  private relativePath: string = ''
  private fullPath: string = ''
  _state: AudioState = 'stopped'
  audioEl: HTMLAudioElement

  constructor(app: App, audioPath: string, volume: number = 0.5, loop: boolean = false) {
    const audioElement = new Audio()
    audioElement.volume = volume
    audioElement.loop = loop

    this.app = app
    this.audioEl = audioElement
    this.relativePath = audioPath
    this.fullPath = getFullPath(this.app, audioPath)

    this.loadAudio()
  }

  get state(): AudioState {
    return this._state
  }

  set path(path: string) {
    this.relativePath = path
    this.fullPath = getFullPath(this.app, path)
    this.loadAudio()
  }

  get path(): string {
    return this.relativePath
  }

  set volume(volume: number) {
    this.audioEl.volume = volume
  }

  get volume(): number {
    return this.audioEl.volume
  }

  set loop(loop: boolean) {
    this.audioEl.loop = loop
  }

  get loop(): boolean {
    return this.audioEl.loop
  }

  async play(): Promise<void> {
    this._state = 'playing'
    await this.audioEl.play()
  }

  pause(): void {
    this._state = 'paused'
    this.audioEl.pause()
  }

  stop(): void {
    this._state = 'stopped'
    this.audioEl.pause()
    this.audioEl.currentTime = 0
  }

  private loadAudio(): void {
    if (!fileExists(this.app, this.fullPath)) return
    const audioData = readFile(this.app, this.fullPath)
    if (!audioData) return
    const base64Data = audioData.toString('base64')
    this.audioEl.src = `data:audio/mpeg;base64,${base64Data}`
    this.audioEl.load()
  }
}
