import { App, TFile } from 'obsidian'

export default class AudioFile {
  app: App
  tfile: TFile | null = null
  state: 'playing' | 'paused' | 'stopped' = 'stopped'
  audioEl: HTMLAudioElement

  constructor(app: App, audioPath: string, volume: number = 0.5, loop: boolean = false) {
    const tfile = app.vault.getFileByPath(audioPath)
    if (tfile) {
      this.tfile = tfile
    }
    const audioElement = document.createElement('audio')
    audioElement.src = audioPath
    audioElement.volume = volume
    audioElement.loop = loop

    this.app = app
    this.audioEl = audioElement
    this.path = audioPath
  }

  set path(path: string) {
    this.audioEl.src = path
    this.tfile = this.app.vault.getFileByPath(path)
  }

  get path(): string {
    return this.audioEl.src
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
}
