import { Plugin } from 'obsidian'
import { TtrpgAudioManagerSettings } from './types'
import { TtrpgAudioManagerSettingTab } from './settings'
import { DEFAULT_SETTINGS } from './constants'

export default class TtrpgAudioManagerPlugin extends Plugin {
  settings: TtrpgAudioManagerSettings

  async onload() {
    await this.loadSettings()
    this.addSettingTab(new TtrpgAudioManagerSettingTab(this.app, this))
  }

  onunload() {}

  async loadSettings() {
    const loaded = await this.loadData()
    this.settings = { ...DEFAULT_SETTINGS, ...loaded }
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
