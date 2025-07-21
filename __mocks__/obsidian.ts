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
