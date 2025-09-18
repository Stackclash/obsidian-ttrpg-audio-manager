import { App, FileSystemAdapter } from 'obsidian'
import { join as pathJoin, isAbsolute } from 'path'
import fs from 'fs'

export const getVaultPath = (app: App): string => {
  const adapter = app.vault.adapter
  if (adapter instanceof FileSystemAdapter) {
    return adapter.getBasePath()
  }
  return ''
}

export const getFullPath = (app: App, path: string): string => {
  if (isAbsolute(path)) {
    return path
  } else {
    return pathJoin(getVaultPath(app), path)
  }
}

export const fileExists = (app: App, path: string): boolean => {
  try {
    const adapter = app.vault.adapter

    if (fs.existsSync(path) && fs.statSync(path).isFile()) {
      return true
    }

    if (adapter instanceof FileSystemAdapter) {
      const fullPath = getFullPath(app, path);
      return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
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
