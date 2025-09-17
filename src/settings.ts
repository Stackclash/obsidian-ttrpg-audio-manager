import { App, PluginSettingTab, Setting } from 'obsidian'
import TtrpgAudioManagerPlugin from './main'
import PlaylistModal from './modals/PlaylistModal'
import SceneModal from './modals/SceneModal'
import { AudioFolderSuggester } from './suggesters/AudioFolderSuggester'

export class TtrpgAudioManagerSettingTab extends PluginSettingTab {
  plugin: TtrpgAudioManagerPlugin

  playlistSettingModal: PlaylistModal

  scenesSettingModal: SceneModal

  constructor(app: App, plugin: TtrpgAudioManagerPlugin) {
    super(app, plugin)
    this.plugin = plugin
    this.playlistSettingModal = new PlaylistModal(this.app, this.plugin.settings.audioFolders)
    this.scenesSettingModal = new SceneModal(this.app, this.plugin.settings.audioFolders)
  }

  reload(): void {
    const { containerEl } = this

    containerEl.empty()
    this.display()
  }

  display(): void {
    this.addFolderGroupSettings()
    this.addPlaylistSettings()
    this.addSceneSettings()
  }

  addFolderGroupSettings(): void {
    new Setting(this.containerEl).setName('Audio Folders').setHeading()

    const desc = document.createDocumentFragment()
    desc.append('Audio folders which will be searched for audio files')

    new Setting(this.containerEl).setDesc(desc)

    this.plugin.settings.audioFolders.forEach((audioFolder, index) => {
      const setting = new Setting(this.containerEl)
        .addSearch(search => {
          new AudioFolderSuggester(this.app, search.inputEl)
          search
            .setPlaceholder('Enter folder path')
            .setValue(audioFolder)
            .onChange(value => {
              this.plugin.settings.audioFolders[index] = value
              this.plugin.saveSettings()
            })
        })
        .addExtraButton(button => {
          button
            .setIcon('trash-2')
            .setTooltip('Remove')
            .onClick(() => {
              this.plugin.settings.audioFolders.splice(index, 1)
              this.plugin.saveSettings()
              this.reload()
            })
        })
      setting.settingEl.addClass('setting-search-input-width-100')
    })

    new Setting(this.containerEl).addButton(button => {
      button
        .setButtonText('Add new audio folder')
        .setCta()
        .onClick(() => {
          this.plugin.settings.audioFolders.push('')
          this.plugin.saveSettings()
          this.reload()
        })
    })
  }

  addPlaylistSettings(): void {
    this.playlistSettingModal.events.on('playlist-modal-close', data => {
      this.plugin.settings.playlists[data.index] = data.settings
      this.plugin.saveSettings()
      this.reload()
    })

    new Setting(this.containerEl).setName('Playlists').setHeading()

    const desc = document.createDocumentFragment()
    desc.append(
      'Playlists of audio files to play in order. You can adjust the volume ' +
        'and whether to loop the playlist.',
    )

    new Setting(this.containerEl).setDesc(desc)

    this.plugin.settings.playlists.forEach((playlist, index) => {
      new Setting(this.containerEl)
        .addText(text => {
          text
            .setPlaceholder('Enter playlist name')
            .setValue(playlist.name)
            .onChange(value => {
              this.plugin.settings.playlists[index].name = value
              this.plugin.saveSettings()
            })
        })
        .addExtraButton(button => {
          button
            .setIcon('settings')
            .setTooltip('Playlist Settings')
            .onClick(() => {
              this.playlistSettingModal.loadSettings(playlist, index)
              this.playlistSettingModal.open()
            })
        })
        .addExtraButton(button => {
          button
            .setIcon('trash-2')
            .setTooltip('Remove')
            .onClick(() => {
              this.plugin.settings.playlists.splice(index, 1)
              this.plugin.saveSettings()
              this.reload()
            })
        })
    })

    new Setting(this.containerEl).addButton(button => {
      button
        .setButtonText('Add new playlist')
        .setCta()
        .onClick(() => {
          this.plugin.settings.playlists.push({
            name: '',
            volume: 0,
            loop: false,
            audioPaths: [],
          })
          this.plugin.saveSettings()
          this.reload()
        })
    })
  }

  addSceneSettings(): void {
    this.scenesSettingModal.events.on('scene-modal-close', data => {
      this.plugin.settings.scenes[data.index] = data.settings
      this.plugin.saveSettings()
      this.reload()
    })

    new Setting(this.containerEl).setName('Scenes').setHeading()

    const desc = document.createDocumentFragment()
    desc.append(
      'Scenes are groups of audio files to play together. Each scene can ' +
        'have multiple audio files with their own volume settings. Use scenes ' +
        'to create ambiance for different locations or situations.',
    )

    new Setting(this.containerEl).setDesc(desc)

    this.plugin.settings.scenes.forEach((scene, index) => {
      new Setting(this.containerEl)
        .addText(text => {
          text
            .setPlaceholder('Enter scene name')
            .setValue(scene.name)
            .onChange(value => {
              this.plugin.settings.scenes[index].name = value
              this.plugin.saveSettings()
            })
        })
        .addExtraButton(button => {
          button
            .setIcon('settings')
            .setTooltip('Scene Settings')
            .onClick(() => {
              this.scenesSettingModal.loadSettings(scene, index)
              this.scenesSettingModal.open()
            })
        })
        .addExtraButton(button => {
          button
            .setIcon('trash-2')
            .setTooltip('Remove')
            .onClick(() => {
              this.plugin.settings.scenes.splice(index, 1)
              this.plugin.saveSettings()
              this.reload()
            })
        })
    })

    new Setting(this.containerEl).addButton(button => {
      button
        .setButtonText('Add new scene')
        .setCta()
        .onClick(() => {
          this.plugin.settings.scenes.push({
            name: '',
            audioSettings: [],
          })
          this.plugin.saveSettings()
          this.reload()
        })
    })
  }
}
