/* eslint-disable @typescript-eslint/no-require-imports */
import AudioFile from '../../src/audio/AudioFile'
import * as obsidian from 'obsidian'

jest.mock('../../src/utils/fileUtils', () => ({
  fileExists: jest.fn(),
  getFullPath: jest.fn(() => '/mock/path/test.mp3'),
  readFile: jest.fn(),
}))

describe('AudioFile Class', () => {
  let mockApp: obsidian.App
  let audioFile: AudioFile
  const path = 'test.mp3'
  const volume = 0.5
  const loop = true

  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
    mockApp = {} as obsidian.App
    audioFile = new AudioFile(mockApp, path, volume, loop)
  })

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(audioFile.path).toBe(path)
      expect(audioFile.volume).toBe(volume)
      expect(audioFile.loop).toBe(loop)
      expect(audioFile.state).toBe('stopped')
      expect(audioFile.audioEl).toBeInstanceOf(HTMLAudioElement)
    })
  })

  describe('path', () => {
    it('should set and get path', () => {
      audioFile.path = 'new.mp3'
      expect(audioFile.path).toBe('new.mp3')
    })
  })

  describe('volume', () => {
    it('should set and get volume', () => {
      audioFile.volume = 0.8
      expect(audioFile.volume).toBe(0.8)
    })
  })

  describe('loop', () => {
    it('should set and get loop', () => {
      audioFile.loop = false
      expect(audioFile.loop).toBe(false)
    })
  })

  describe('play', () => {
    it('should play audio and set state to playing', async () => {
      const playMock = jest
        .spyOn(audioFile.audioEl, 'play')
        .mockImplementation(() => Promise.resolve())
      await audioFile.play()
      expect(audioFile.state).toBe('playing')
      expect(playMock).toHaveBeenCalled()
      playMock.mockRestore()
    })
  })

  describe('pause', () => {
    it('should pause audio and set state to paused', () => {
      const pauseMock = jest.spyOn(audioFile.audioEl, 'pause').mockImplementation(() => {})
      audioFile.pause()
      expect(audioFile.state).toBe('paused')
      expect(pauseMock).toHaveBeenCalled()
      pauseMock.mockRestore()
    })
  })

  describe('stop', () => {
    it('should stop audio, set state to stopped, and reset currentTime', () => {
      const pauseMock = jest.spyOn(audioFile.audioEl, 'pause').mockImplementation(() => {})
      audioFile.audioEl.currentTime = 10
      audioFile.stop()
      expect(audioFile.state).toBe('stopped')
      expect(audioFile.audioEl.currentTime).toBe(0)
      expect(pauseMock).toHaveBeenCalled()
      pauseMock.mockRestore()
    })
  })

  describe('loadAudio', () => {
    it('should not load audio if file does not exist', () => {
      const { fileExists } = require('../../src/utils/fileUtils')
      fileExists.mockReturnValue(false)
      const af = new AudioFile(mockApp, 'missing.mp3', volume, loop)
      expect(af.audioEl.src).toBe('')
    })

    it('should load audio if file exists and data is present', () => {
      const { fileExists, readFile } = require('../../src/utils/fileUtils')
      fileExists.mockReturnValue(true)
      readFile.mockReturnValue(Buffer.from('testdata'))
      HTMLMediaElement.prototype.load = jest.fn()
      const af = new AudioFile(mockApp, 'exists.mp3', volume, loop)
      expect(af.audioEl.src.startsWith('data:audio/mpeg;base64,')).toBe(true)
    })
  })
})
