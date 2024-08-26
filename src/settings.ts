import { App, PluginSettingTab, Setting } from 'obsidian'
import TtrpgAudioControllerPlugin from './main'
import { TtrpgAudioControllerSettings } from './types'

export const DEFAULT_SETTINGS: TtrpgAudioControllerSettings = {
  audioFolderSettings: [],
  playlists: [],
  scenes: [],
}

export class TtrpgAudioControllerSettingTab extends PluginSettingTab {
  plugin: TtrpgAudioControllerPlugin

  constructor(app: App, plugin: TtrpgAudioControllerPlugin) {
    super(app, plugin)
    this.plugin = plugin
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

    this.plugin.settings.audioFolderSettings.forEach((audioFolderSetting, index) => {
      new Setting(this.containerEl)
        .addText((text) => {
          text
            .setPlaceholder('Enter folder path')
            .setValue(audioFolderSetting.folderPath)
            .onChange((value) => {
              this.plugin.settings.audioFolderSettings[index].folderPath = value
              this.plugin.saveSettings()
            })
        })
        .addExtraButton((button) => {
          button
            .setIcon('cross')
            .setTooltip('Remove')
            .onClick(() => {
              this.plugin.settings.audioFolderSettings.splice(index, 1)
              this.plugin.saveSettings()
              this.display()
            })
        })
      new Setting(this.containerEl)
        .addSlider((slider) => {
          slider
            .setLimits(0, 100, 1)
            .setValue(audioFolderSetting.volume)
            .setDynamicTooltip()
            .onChange((value) => {
              this.plugin.settings.audioFolderSettings[index].volume = value
              this.plugin.saveSettings()
            })
        })
        .addToggle((toggle) => {
          toggle
            .setValue(audioFolderSetting.loop)
            .setTooltip('Loop audio')
            .onChange((value) => {
              this.plugin.settings.audioFolderSettings[index].loop = value
              this.plugin.saveSettings()
            })
        })
    })

    new Setting(this.containerEl).addButton((cb) => {
      cb.setButtonText('Add new audio folder')
        .setCta()
        .onClick(() => {
          this.plugin.settings.audioFolderSettings.push({
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
            .setIcon('plus')
            .setTooltip('Add Audio File')
            .onClick(() => {
              this.plugin.settings.playlists[index].audioPaths.push('')
              this.plugin.saveSettings()
              this.display()
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

      playlist.audioPaths.forEach((audioPath, audioIndex) => {
        new Setting(this.containerEl)
          .addText((text) => {
            text
              .setPlaceholder('Enter Audio File Path')
              .setValue(audioPath)
              .onChange((value) => {
                this.plugin.settings.playlists[index].audioPaths[audioIndex] = value
                this.plugin.saveSettings()
              })
          })
          .addExtraButton((button) => {
            button
              .setIcon('cross')
              .setTooltip('Remove')
              .onClick(() => {
                this.plugin.settings.playlists[index].audioPaths.splice(audioIndex, 1)
                this.plugin.saveSettings()
                this.display()
              })
          })
      })
    })

    new Setting(this.containerEl).addButton((cb) => {
      cb.setButtonText('Add new playlist')
        .setCta()
        .onClick(() => {
          this.plugin.settings.playlists.push({
            name: '',
            audioPaths: [],
          })
          this.plugin.saveSettings()
          this.display()
        })
    })
  }

  addSceneSettings(): void {
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
            .setIcon('plus')
            .setTooltip('Add Audio File')
            .onClick(() => {
              this.plugin.settings.scenes[index].audioPaths.push('')
              this.plugin.saveSettings()
              this.display()
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

      scene.audioPaths.forEach((audioPath, audioIndex) => {
        new Setting(this.containerEl)
          .addText((text) => {
            text
              .setPlaceholder('Enter Audio File Path')
              .setValue(audioPath)
              .onChange((value) => {
                this.plugin.settings.scenes[index].audioPaths[audioIndex] = value
                this.plugin.saveSettings()
              })
          })
          .addExtraButton((button) => {
            button
              .setIcon('cross')
              .setTooltip('Remove')
              .onClick(() => {
                this.plugin.settings.scenes[index].audioPaths.splice(audioIndex, 1)
                this.plugin.saveSettings()
                this.display()
              })
          })
      })
    })

    new Setting(this.containerEl).addButton((cb) => {
      cb.setButtonText('Add new scene')
        .setCta()
        .onClick(() => {
          this.plugin.settings.scenes.push({
            name: '',
            audioPaths: [],
          })
          this.plugin.saveSettings()
          this.display()
        })
    })
  }
}
