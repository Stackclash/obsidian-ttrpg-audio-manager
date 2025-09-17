import { App } from 'obsidian'
import { join as pathJoin } from 'path'
import fs from 'fs'

export const fileExists = (app: App, path: string): boolean => {
  try {
    fs.accessSync(pathJoin(app.vault.getRoot().path, path), fs.constants.F_OK)
    return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return false
  }
}
