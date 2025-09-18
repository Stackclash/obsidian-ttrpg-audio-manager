import TtrpgAudioManagerPlugin from '../src/main'
import { TtrpgAudioManagerSettings } from '../src/types'
import { DEFAULT_SETTINGS } from '../src/constants'
import * as obsidian from 'obsidian'

jest.mock('../src/settings', () => ({
  TtrpgAudioManagerSettingTab: jest.fn(),
}))

describe('TtrpgAudioManagerPlugin', () => {
  let mockApp: obsidian.App
  let plugin: TtrpgAudioManagerPlugin

  beforeEach(() => {
    mockApp = {} as obsidian.App
    plugin = new TtrpgAudioManagerPlugin(mockApp, {} as obsidian.PluginManifest)
    plugin.loadData = jest.fn().mockResolvedValue({})
    plugin.saveData = jest.fn().mockResolvedValue(undefined)
    plugin.addSettingTab = jest.fn()
  })

  describe('lifecycle', () => {
    it('should load settings and add setting tab on onload', async () => {
      await plugin.onload()
      expect(plugin.settings).toEqual(DEFAULT_SETTINGS)
      expect(plugin.addSettingTab).toHaveBeenCalled()
    })

    it('should not throw on onunload', () => {
      expect(() => plugin.onunload()).not.toThrow()
    })
  })

  describe('settings', () => {
    it('should load settings with defaults', async () => {
      await plugin.loadSettings()
      expect(plugin.settings).toEqual(DEFAULT_SETTINGS)
    })

    it('should save settings', async () => {
      plugin.settings = { ...DEFAULT_SETTINGS, custom: true } as TtrpgAudioManagerSettings
      await plugin.saveSettings()
      expect(plugin.saveData).toHaveBeenCalledWith(plugin.settings)
    })
  })
})
