import { App } from 'obsidian'
import { join as pathJoin } from 'path'
import { fileExists, getFullPath, readFile } from 'src/utils/fileUtils'

export default class AudioFile {
  app: App
  private relativePath: string = ''
  private fullPath: string = ''
  state: 'playing' | 'paused' | 'stopped' = 'stopped'
  audioEl: HTMLAudioElement

  constructor(app: App, audioPath: string, volume: number = 0.5, loop: boolean = false) {
    const audioElement = new Audio()
    audioElement.volume = volume
    audioElement.loop = loop

    this.app = app
    this.audioEl = audioElement
    this.relativePath = audioPath
    this.fullPath = pathJoin(app.vault.getRoot().path, audioPath)

    this.loadAudio()
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
    await this.audioEl.play()
    this.state = 'playing'
  }

  pause(): void {
    this.audioEl.pause()
    this.state = 'paused'
  }

  stop(): void {
    this.audioEl.pause()
    this.audioEl.currentTime = 0
    this.state = 'stopped'
  }

  private loadAudio(): void {
    if (!fileExists(this.app, this.relativePath)) return
    const audioData = readFile(this.app, this.fullPath)
    if (!audioData) return
    const base64Data = audioData.toString('base64')
    this.audioEl.src = `data:audio/mpeg;base64,${base64Data}`
    this.audioEl.load()
  }
}
