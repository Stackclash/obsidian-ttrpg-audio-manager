import { App, Events, Modal, Setting } from 'obsidian'
import AudioScene from 'src/audio/AudioScene'
import { AudioFileSuggester } from 'src/suggesters/AudioFileSuggester'
import { AudioFolderSettings, SceneSettings } from 'src/types'

export default class SceneModal extends Modal {
  settings: SceneSettings
  settingIndex: number
  events: Events
  testScene: AudioScene
  audioFolderSettings: AudioFolderSettings

  constructor(app: App, audioFolderSettings: AudioFolderSettings) {
    super(app)
    this.events = new Events()
    this.audioFolderSettings = audioFolderSettings
  }

  onOpen(): void {
    this.setTitle(`${this.settings.name ? this.settings.name + ' ' : ''}Scene Settings`)
    this.events.trigger('scene-modal-open')
    this.contentEl.empty()
    this.display()
  }

  onClose(): void {
    if (this.testScene) this.testScene.stop()
    this.events.trigger('scene-modal-close', {
      settings: this.settings,
      index: this.settingIndex,
    })
  }

  loadSettings(settings: SceneSettings, index: number): void {
    this.settings = settings
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
        if (this.testScene) {
          this.testScene.stop()
        }

        this.testScene = new AudioScene(this.app, this.settings.name, this.settings.audioSettings)

        if (this.testScene.state === 'playing') {
          this.testScene.stop()
        } else {
          this.testScene.play()
        }
        this.reload()
      })
      if (!this.testScene || this.testScene.state !== 'playing') {
        button.setIcon('play')
      } else {
        button.setIcon('square')
      }
      if (this.settings.audioSettings.length === 0) {
        button.setDisabled(true)
      }
    })

    this.settings.audioSettings.forEach((audioSetting, index) => {
      const setting = new Setting(contentEl)
        .addSearch(search => {
          new AudioFileSuggester(this.app, search.inputEl, this.audioFolderSettings)
          search
            .setPlaceholder('Enter Audio File Path')
            .setValue(this.settings.audioSettings[index].audioPath)
            .onChange(value => {
              this.settings.audioSettings[index].audioPath = value
            })
        })
        .addSlider(slider => {
          slider
            .setLimits(0, 100, 1)
            .setDynamicTooltip()
            .setValue(audioSetting.volume * 100)
            .onChange(value => {
              this.settings.audioSettings[index].volume = value / 100
            })
        })
        .addExtraButton(button => {
          button
            .setIcon('trash-2')
            .setTooltip('Remove')
            .onClick(() => {
              this.settings.audioSettings.splice(index, 1)
              this.reload()
            })
        })

      setting.settingEl.addClass('setting-search-input-width-100')
    })

    new Setting(contentEl).addButton(button => {
      button.setButtonText('Add Audio File').onClick(() => {
        this.settings.audioSettings.push({
          audioPath: '',
          volume: 0.5,
        })
        this.reload()
      })
    })
  }
}
