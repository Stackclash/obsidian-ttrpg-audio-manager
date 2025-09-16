import { App, Modal, Setting, Events } from 'obsidian'
import { AudioFolderSettings, PlaylistSettings } from 'src/types'
import { AudioFileSuggester } from 'src/suggesters/AudioFileSuggester'
import AudioPlaylist from 'src/audio/AudioPlaylist'

export default class PlaylistModal extends Modal {
  settings: PlaylistSettings
  events: Events
  settingIndex: number
  testPlaylist: AudioPlaylist
  audioFolderSettings: AudioFolderSettings

  constructor(app: App, audioFolderSettings: AudioFolderSettings) {
    super(app)
    this.events = new Events()
    this.audioFolderSettings = audioFolderSettings
  }

  onOpen(): void {
    this.setTitle(`${this.settings.name ? this.settings.name + ' ' : ''}Playlist Settings`)
    this.events.trigger('playlist-modal-open')
    this.contentEl.empty()
    this.display()
  }

  onClose(): void {
    if (this.testPlaylist) this.testPlaylist.stop()
    this.events.trigger('playlist-modal-close', {
      settings: this.settings,
      index: this.settingIndex,
    })
  }

  loadSettings(settings: PlaylistSettings, index: number): void {
    this.settings = settings
    this.settingIndex = index
  }

  reload(): void {
    this.contentEl.empty()
    this.display()
  }

  display(): void {
    const { contentEl } = this
    new Setting(contentEl).setName('Volume').addSlider(slider => {
      slider
        .setLimits(0, 100, 1)
        .setDynamicTooltip()
        .setValue(this.settings.volume * 100)
        .onChange(value => {
          this.settings.volume = value / 100
        })
    })

    new Setting(contentEl).setName('Loop Playlist').addToggle(toggle => {
      toggle.setValue(this.settings.loop).onChange(value => {
        this.settings.loop = value
      })
    })

    new Setting(contentEl).setName('Test Playlist').addButton(button => {
      button.setTooltip('Test Playlist').onClick(() => {
        if (!this.testPlaylist) {
          this.testPlaylist = new AudioPlaylist(
            this.app,
            this.settings.name,
            this.settings.audioPaths,
            this.settings.volume,
            this.settings.loop,
          )
        }
        if (this.testPlaylist.state === 'playing') {
          this.testPlaylist.stop()
        } else {
          this.testPlaylist.play()
        }
        this.reload()
      })
      if (!this.testPlaylist || this.testPlaylist.state !== 'playing') {
        button.setIcon('play')
      } else {
        button.setIcon('square')
      }
      if (this.settings.audioPaths.length === 0) {
        button.setDisabled(true)
      }
    })

    new Setting(contentEl).setName('Audio Files').setHeading()

    this.settings.audioPaths.forEach((value, index) => {
      const setting = new Setting(contentEl)
        .setName(`${index + 1}.`)
        .addSearch(search => {
          new AudioFileSuggester(this.app, search.inputEl, this.audioFolderSettings)
          search
            .setPlaceholder('Enter Audio File Path')
            .setValue(value)
            .onChange(value => {
              this.settings.audioPaths[index] = value
            })
        })
        .addExtraButton(button => {
          button.setIcon('chevron-up').onClick(() => {
            if (index - 1 >= 0) {
              const item = this.settings.audioPaths.splice(index, 1)[0]
              this.settings.audioPaths.splice(index - 1, 0, item)
              this.reload()
            }
          })
        })
        .addExtraButton(button => {
          button.setIcon('chevron-down').onClick(() => {
            if (index + 1 < this.settings.audioPaths.length) {
              const item = this.settings.audioPaths.splice(index, 1)[0]
              this.settings.audioPaths.splice(index + 1, 0, item)
              this.reload()
            }
          })
        })
        .addExtraButton(button => {
          button
            .setIcon('trash-2')
            .setTooltip('Remove')
            .onClick(() => {
              this.settings.audioPaths.splice(index, 1)
              this.reload()
            })
        })
      setting.settingEl.addClass('setting-search-input-width-80')
    })
    new Setting(contentEl).addButton(button => {
      button.setButtonText('Add Audio File').onClick(() => {
        this.settings.audioPaths.push('')
        this.reload()
      })
    })
  }
}
