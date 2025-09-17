import { App, Modal, Setting, Events } from 'obsidian'
import { AudioFolderSettings, PlaylistSettings } from 'src/types'
import { AudioFileSuggester } from 'src/suggesters/AudioFileSuggester'
import AudioPlaylist from 'src/audio/AudioPlaylist'

export default class PlaylistModal extends Modal {
  events: Events
  settingIndex: number
  currentPlaylist: AudioPlaylist
  audioFolderSettings: AudioFolderSettings

  constructor(app: App, audioFolderSettings: AudioFolderSettings) {
    super(app)
    this.events = new Events()
    this.audioFolderSettings = audioFolderSettings
    this.currentPlaylist = new AudioPlaylist(app, '', [], 0, false)
  }

  onOpen(): void {
    this.setTitle(
      `${this.currentPlaylist.name ? this.currentPlaylist.name + ' ' : ''}Playlist Settings`,
    )
    this.events.trigger('playlist-modal-open')
    this.reload()
  }

  onClose(): void {
    if (this.currentPlaylist) this.currentPlaylist.stop()
    this.events.trigger('playlist-modal-close', {
      settings: this.currentPlaylist.toJson(),
      index: this.settingIndex,
    })
  }

  loadSettings(settings: PlaylistSettings, index: number): void {
    this.currentPlaylist = new AudioPlaylist(
      this.app,
      settings.name,
      settings.audioPaths,
      settings.volume,
      settings.loop,
    )
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
        .setValue(this.currentPlaylist.volume * 100)
        .onChange(value => {
          this.currentPlaylist.volume = value / 100
        })
    })

    new Setting(contentEl).setName('Loop Playlist').addToggle(toggle => {
      toggle.setValue(this.currentPlaylist.loop).onChange(value => {
        this.currentPlaylist.loop = value
      })
    })

    new Setting(contentEl).setName('Test Playlist').addButton(button => {
      button.setTooltip('Test Playlist').onClick(async () => {
        Promise.resolve()
          .then(async () => {
            if (this.currentPlaylist.state === 'playing') {
              this.currentPlaylist.stop()
            } else {
              await this.currentPlaylist.play()
            }

            return Promise.resolve()
          })
          .then(() => this.reload())
      })

      if (this.currentPlaylist.state !== 'playing') {
        button.setIcon('play')
      } else {
        button.setIcon('square')
      }
      if (this.currentPlaylist.audioFiles.length === 0) {
        button.setDisabled(true)
      }
    })

    new Setting(contentEl).setName('Audio Files').setHeading()

    this.currentPlaylist.audioFiles.forEach((audioFile, index) => {
      const setting = new Setting(contentEl)
        .setName(`${index + 1}.`)
        .addSearch(search => {
          new AudioFileSuggester(this.app, search.inputEl, this.audioFolderSettings)
          search
            .setPlaceholder('Enter Audio File Path')
            .setValue(audioFile.path)
            .onChange(value => {
              audioFile.path = value
            })
        })
        .addExtraButton(button => {
          button.setIcon('chevron-up').onClick(() => {
            if (index - 1 >= 0) {
              const item = this.currentPlaylist.audioFiles.splice(index, 1)[0]
              this.currentPlaylist.audioFiles.splice(index - 1, 0, item)
              this.reload()
            }
          })
        })
        .addExtraButton(button => {
          button.setIcon('chevron-down').onClick(() => {
            if (index + 1 < this.currentPlaylist.audioFiles.length) {
              const item = this.currentPlaylist.audioFiles.splice(index, 1)[0]
              this.currentPlaylist.audioFiles.splice(index + 1, 0, item)
              this.reload()
            }
          })
        })
        .addExtraButton(button => {
          button
            .setIcon('trash-2')
            .setTooltip('Remove')
            .onClick(() => {
              this.currentPlaylist.audioFiles.splice(index, 1)
              this.reload()
            })
        })
      setting.settingEl.addClass('setting-search-input-width-80')
    })
    new Setting(contentEl).addButton(button => {
      button.setButtonText('Add Audio File').onClick(() => {
        this.currentPlaylist.addAudioFile('')
        this.reload()
      })
    })
  }
}
