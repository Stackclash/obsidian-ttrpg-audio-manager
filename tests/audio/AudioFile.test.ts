import AudioFile from '../../src/audio/AudioFile'
import * as obsidian from 'obsidian'

describe('AudioFile Class', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should successfully create an AudioFile instance if the file exists', () => {
    const app = new obsidian.App()
    app.vault.getFileByPath = jest.fn().mockReturnValue(new obsidian.TFile())
    const audioFile = new AudioFile(app, 'test.mp3', 0.5)
    expect(audioFile).toBeInstanceOf(AudioFile)
  })

  it('should throw an error when the file does not exist', () => {
    const app = new obsidian.App()
    app.vault.getFileByPath = jest.fn().mockReturnValue(null)
    expect(() => {
      new AudioFile(app, 'test.mp3', 0.5)
    }).toThrow()
  })
})
