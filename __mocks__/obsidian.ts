import { PluginManifest } from 'obsidian'

/* eslint-disable @typescript-eslint/no-unused-vars */
export class App {
  vault: Vault

  constructor() {
    this.vault = new Vault()
  }
}

export class Vault {
  getResourcePath(tfile: TFile): string {
    return 'mocked-resource-path'
  }

  getFileByPath(path: string): TFile | null {
    return new TFile()
  }
}

export class TFile {
  vault: Vault

  constructor() {
    this.vault = new Vault()
  }
}

export class Plugin {
  app: App
  manifest: PluginManifest

  constructor(app: App, manifest: PluginManifest) {
    this.app = app
    this.manifest = manifest
  }
}
