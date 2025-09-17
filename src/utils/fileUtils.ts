import { App, FileSystemAdapter } from 'obsidian'
import { join as pathJoin } from 'path'
import fs from 'fs'

export const getVaultPath = (app: App): string => {
  const adapter = app.vault.adapter
  if (adapter instanceof FileSystemAdapter) {
    return adapter.getBasePath()
  }
  return ''
}

export const getFullPath = (app: App, relativePath: string): string => {
  return pathJoin(getVaultPath(app), relativePath)
}

export const fileExists = (app: App, path: string): boolean => {
  try {
    const adapter = app.vault.adapter

    if (fs.existsSync(pathJoin(path))) {
      return fs.statSync(path).isFile()
    } else if (adapter instanceof FileSystemAdapter) {
      return fs.statSync(pathJoin(adapter.getBasePath(), path)).isFile()
    }

    return false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return false
  }
}

export const readFile = (app: App, path: string): Buffer | null => {
  try {
    if (!fileExists(app, path)) return null
    const adapter = app.vault.adapter

    if (adapter instanceof FileSystemAdapter) {
      return fs.readFileSync(getFullPath(app, path))
    }

    return null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return null
  }
}
