import { App, Events, Modal, Setting } from 'obsidian'
import AudioScene from 'src/audio/AudioScene'
import { AudioFileSuggester } from 'src/suggesters/AudioFileSuggester'
import { AudioFolderSettings, SceneSettings } from 'src/types'

export default class SceneModal extends Modal {
  settingIndex: number
  events: Events
  currentScene: AudioScene
  audioFolderSettings: AudioFolderSettings

  constructor(app: App, audioFolderSettings: AudioFolderSettings) {
    super(app)
    this.events = new Events()
    this.audioFolderSettings = audioFolderSettings
    this.currentScene = new AudioScene(app, '', [])
  }

  onOpen(): void {
    this.setTitle(`${this.currentScene.name ? this.currentScene.name + ' ' : ''}Scene Settings`)
    this.events.trigger('scene-modal-open')
    this.reload()
  }

  onClose(): void {
    if (this.currentScene) this.currentScene.stop()
    this.events.trigger('scene-modal-close', {
      settings: this.currentScene.toJson(),
      index: this.settingIndex,
    })
  }

  loadSettings(settings: SceneSettings, index: number): void {
    this.currentScene = new AudioScene(this.app, settings.name, settings.audioSettings)
    this.settingIndex = index
  }

  reload(): void {
    this.contentEl.empty()
    this.display()
  }

  display(): void {
    const { contentEl } = this

    const desc = document.createDocumentFragment()
    desc.append(
      'Settings for individual scenes. Each scene can have multiple audio files with their own volume settings.',
    )

    new Setting(contentEl).setDesc(desc)

    new Setting(contentEl).setName('Test Scene').addButton(button => {
      button.setTooltip('Test Scene').onClick(() => {
        Promise.resolve()
          .then(async () => {
            if (this.currentScene.state === 'playing') {
              this.currentScene.stop()
            } else {
              await this.currentScene.play()
            }

            return Promise.resolve()
          })
          .then(() => this.reload())
      })

      if (this.currentScene.state !== 'playing') {
        button.setIcon('play')
      } else {
        button.setIcon('square')
      }
      if (this.currentScene.audioFiles.length === 0) {
        button.setDisabled(true)
      }
    })

    this.currentScene.audioFiles.forEach((audioFile, index) => {
      const setting = new Setting(contentEl)
        .addSearch(search => {
          new AudioFileSuggester(this.app, search.inputEl, this.audioFolderSettings)
          search
            .setPlaceholder('Enter Audio File Path')
            .setValue(audioFile.path)
            .onChange(value => {
              audioFile.path = value
            })
        })
        .addSlider(slider => {
          slider
            .setLimits(0, 100, 1)
            .setDynamicTooltip()
            .setValue(audioFile.volume * 100)
            .onChange(value => {
              audioFile.volume = value / 100
            })
        })
        .addExtraButton(button => {
          button
            .setIcon('trash-2')
            .setTooltip('Remove')
            .onClick(() => {
              this.currentScene.removeAudioFileByIndex(index)
              this.reload()
            })
        })

      setting.settingEl.addClass('setting-search-input-width-100')
    })

    new Setting(contentEl).addButton(button => {
      button.setButtonText('Add Audio File').onClick(() => {
        this.currentScene.addAudioFile('', 0)
        this.reload()
      })
    })
  }
}
