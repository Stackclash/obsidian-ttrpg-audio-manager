import { App, PluginSettingTab, Setting } from 'obsidian'
import TtrpgAudioControllerPlugin from './main'
import PlaylistModal from './modals/PlaylistModal'
import SceneModal from './modals/SceneModal'
import { AudioFolderSuggester } from './suggesters/AudioFolderSuggester'

export class TtrpgAudioControllerSettingTab extends PluginSettingTab {
  plugin: TtrpgAudioControllerPlugin

  playlistSettingModal: PlaylistModal

  scenesSettingModal: SceneModal

  constructor(app: App, plugin: TtrpgAudioControllerPlugin) {
    super(app, plugin)
    this.plugin = plugin
    this.playlistSettingModal = new PlaylistModal(this.app)
    this.scenesSettingModal = new SceneModal(this.app)
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    this.addFolderGroupSettings()
    this.addPlaylistSettings()
    this.addSceneSettings()
  }

  addFolderGroupSettings(): void {
    new Setting(this.containerEl).setName('Audio Folders').setHeading()

    const desc = document.createDocumentFragment()
    desc.append('Audio folders with their own settings when playing individual audio files')

    new Setting(this.containerEl).setDesc(desc)

    this.plugin.settings.audioFolders.forEach((audioFolderSetting, index) => {
      const setting = new Setting(this.containerEl)
        .addSearch((search) => {
          new AudioFolderSuggester(this.app, search.inputEl)
          search
            .setPlaceholder('Enter folder path')
            .setValue(audioFolderSetting.folderPath)
            .onChange((value) => {
              this.plugin.settings.audioFolders[index].folderPath = value
              this.plugin.saveSettings()
            })
        })
        .addExtraButton((button) => {
          button
            .setIcon('cross')
            .setTooltip('Remove')
            .onClick(() => {
              this.plugin.settings.audioFolders.splice(index, 1)
              this.plugin.saveSettings()
              this.display()
            })
        })
      setting.settingEl.addClass('setting-search-input-width-100')

      new Setting(this.containerEl)
        .addSlider((slider) => {
          slider
            .setLimits(0, 100, 1)
            .setValue(audioFolderSetting.volume)
            .setDynamicTooltip()
            .onChange((value) => {
              this.plugin.settings.audioFolders[index].volume = value
              this.plugin.saveSettings()
            })
        })
        .addToggle((toggle) => {
          toggle
            .setValue(audioFolderSetting.loop)
            .setTooltip('Loop audio')
            .onChange((value) => {
              this.plugin.settings.audioFolders[index].loop = value
              this.plugin.saveSettings()
            })
        })
    })

    new Setting(this.containerEl).addButton((button) => {
      button
        .setButtonText('Add new audio folder')
        .setCta()
        .onClick(() => {
          this.plugin.settings.audioFolders.push({
            folderPath: '',
            volume: 100,
            loop: false,
          })
          this.plugin.saveSettings()
          this.display()
        })
    })
  }

  addPlaylistSettings(): void {
    this.playlistSettingModal.events.on('playlist-modal-close', (data) => {
      this.plugin.settings.playlists[data.index] = data.settings
      this.plugin.saveSettings()
    })

    new Setting(this.containerEl).setName('Playlists').setHeading()

    const desc = document.createDocumentFragment()
    desc.append('Playlists of audio files to play in order')

    new Setting(this.containerEl).setDesc(desc)

    this.plugin.settings.playlists.forEach((playlist, index) => {
      new Setting(this.containerEl)
        .addText((text) => {
          text
            .setPlaceholder('Enter playlist name')
            .setValue(playlist.name)
            .onChange((value) => {
              this.plugin.settings.playlists[index].name = value
              this.plugin.saveSettings()
            })
        })
        .addExtraButton((button) => {
          button
            .setIcon('settings')
            .setTooltip('Playlist Settings')
            .onClick(() => {
              this.playlistSettingModal.loadSettings(playlist, index)
              this.playlistSettingModal.open()
            })
        })
        .addExtraButton((button) => {
          button
            .setIcon('cross')
            .setTooltip('Remove')
            .onClick(() => {
              this.plugin.settings.playlists.splice(index, 1)
              this.plugin.saveSettings()
              this.display()
            })
        })
    })

    new Setting(this.containerEl).addButton((button) => {
      button
        .setButtonText('Add new playlist')
        .setCta()
        .onClick(() => {
          this.plugin.settings.playlists.push({
            name: '',
            volume: 50,
            loop: false,
            audioPaths: [],
          })
          this.plugin.saveSettings()
          this.display()
        })
    })
  }

  addSceneSettings(): void {
    this.scenesSettingModal.events.on('scene-modal-close', (data) => {
      this.plugin.settings.scenes[data.index] = data.settings
      this.plugin.saveSettings()
    })

    new Setting(this.containerEl).setName('Scenes').setHeading()

    const desc = document.createDocumentFragment()
    desc.append('Scenes you can reference in your notes')

    new Setting(this.containerEl).setDesc(desc)

    this.plugin.settings.scenes.forEach((scene, index) => {
      new Setting(this.containerEl)
        .addText((text) => {
          text
            .setPlaceholder('Enter scene name')
            .setValue(scene.name)
            .onChange((value) => {
              this.plugin.settings.scenes[index].name = value
              this.plugin.saveSettings()
            })
        })
        .addExtraButton((button) => {
          button
            .setIcon('settings')
            .setTooltip('Playlist Settings')
            .onClick(() => {
              this.scenesSettingModal.loadSettings(scene, index)
              this.scenesSettingModal.open()
            })
        })
        .addExtraButton((button) => {
          button
            .setIcon('cross')
            .setTooltip('Remove')
            .onClick(() => {
              this.plugin.settings.scenes.splice(index, 1)
              this.plugin.saveSettings()
              this.display()
            })
        })
    })

    new Setting(this.containerEl).addButton((button) => {
      button
        .setButtonText('Add new scene')
        .setCta()
        .onClick(() => {
          this.plugin.settings.scenes.push({
            name: '',
            audioSettings: [],
          })
          this.plugin.saveSettings()
          this.display()
        })
    })
  }
}
