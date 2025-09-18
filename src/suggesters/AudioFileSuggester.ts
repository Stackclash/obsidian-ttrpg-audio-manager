// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { AbstractInputSuggest, App, TAbstractFile, TFile } from 'obsidian'
import { ALLOWED_FILE_EXTENSIONS } from '../constants'

export class AudioFileSuggester extends AbstractInputSuggest<TFile> {
  inputEl: HTMLInputElement
  allowedFolders: string[]

  constructor(app: App, inputEl: HTMLInputElement, allowedFolders: string[] = []) {
    super(app, inputEl)
    this.inputEl = inputEl
    this.allowedFolders = allowedFolders
  }

  getSuggestions(inputStr: string): TFile[] {
    const abstractFiles = this.app.vault.getAllLoadedFiles()
    const files: TFile[] = []
    const lowerCaseInputStr = inputStr.toLowerCase()

    abstractFiles.forEach((file: TAbstractFile) => {
      if (
        file instanceof TFile &&
        ALLOWED_FILE_EXTENSIONS.includes(file.extension) &&
        file.path.toLowerCase().contains(lowerCaseInputStr) &&
        (this.allowedFolders
          ? this.allowedFolders.some(folder => file.path.includes(folder))
          : true)
      ) {
        files.push(file)
      }
    })

    return files.slice(0, 1000)
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    el.setText(file.path)
  }

  selectSuggestion(file: TFile): void {
    this.inputEl.value = file.path
    this.inputEl.trigger('input')
    this.close()
  }
}
