import AudioFile from '../../src/classes/AudioFile'
import { App } from 'obsidian'
import { fileExists, getFullPath, readFile } from '../../src/utils/fileUtils'

// Mocks for fileUtils
jest.mock('../../src/utils/fileUtils', () => ({
  fileExists: jest.fn(),
  getFullPath: jest.fn(),
  readFile: jest.fn(),
}))

const mockedFileExists = fileExists as jest.MockedFunction<typeof fileExists>
const mockedReadFile = readFile as jest.MockedFunction<typeof readFile>
const mockedGetFullPath = getFullPath as jest.MockedFunction<typeof getFullPath>

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: jest.fn(),
})

describe('AudioFile', () => {
  let app: App

  beforeEach(() => {
    app = {} as App
    jest.clearAllMocks()
    mockedGetFullPath.mockImplementation((_app: App, path: string) => `/mocked/path/${path}`)
  })

  describe('constructor', () => {
    it('should initialize with default values and load audio', () => {
      mockedFileExists.mockReturnValue(true)
      mockedReadFile.mockReturnValue(Buffer.from('mockdata'))
      const audioFile = new AudioFile(app, 'test.mp3')
      expect(audioFile.path).toBe('test.mp3')
      expect(audioFile.volume).toBe(0.5)
      expect(audioFile.loop).toBe(false)
      expect(audioFile.state).toBe('stopped')
      expect(audioFile.audioEl.src).toContain('data:audio/mpeg;base64')
    })

    it('should not set src if file does not exist', () => {
      mockedFileExists.mockReturnValue(false)
      const audioFile = new AudioFile(app, 'missing.mp3')
      expect(audioFile.audioEl.src).toBe('')
    })
  })

  describe('state', () => {
    it('should get initial state', () => {
      const audioFile = new AudioFile(app, 'test.mp3')
      expect(audioFile.state).toBe('stopped')
    })
  })

  describe('path', () => {
    it('should update path and reload audio', () => {
      mockedFileExists.mockReturnValue(true)
      mockedReadFile.mockReturnValue(Buffer.from('mockdata'))
      const audioFile = new AudioFile(app, 'test.mp3')
      audioFile.path = 'new.mp3'
      expect(audioFile.path).toBe('new.mp3')
      expect(audioFile.audioEl.src).toContain('data:audio/mpeg;base64')
    })
  })

  describe('volume', () => {
    it('should set and get volume', () => {
      const audioFile = new AudioFile(app, 'test.mp3')
      audioFile.volume = 0.8
      expect(audioFile.volume).toBe(0.8)
    })
  })

  describe('loop', () => {
    it('should set and get loop', () => {
      const audioFile = new AudioFile(app, 'test.mp3')
      audioFile.loop = true
      expect(audioFile.loop).toBe(true)
    })
  })

  describe('play', () => {
    it('should set state to playing and call play on audioEl', async () => {
      const audioFile = new AudioFile(app, 'test.mp3')
      const playMock = jest.spyOn(audioFile.audioEl, 'play').mockResolvedValue()
      await audioFile.play()
      expect(audioFile.state).toBe('playing')
      expect(playMock).toHaveBeenCalled()
    })
  })

  describe('pause', () => {
    it('should set state to paused and call pause on audioEl', () => {
      const audioFile = new AudioFile(app, 'test.mp3')
      const pauseMock = jest.spyOn(audioFile.audioEl, 'pause').mockImplementation()
      audioFile.pause()
      expect(audioFile.state).toBe('paused')
      expect(pauseMock).toHaveBeenCalled()
    })
  })

  describe('stop', () => {
    it('should set state to stopped, pause audioEl, and reset currentTime', () => {
      const audioFile = new AudioFile(app, 'test.mp3')
      const pauseMock = jest.spyOn(audioFile.audioEl, 'pause').mockImplementation()
      audioFile.audioEl.currentTime = 5
      audioFile.stop()
      expect(audioFile.state).toBe('stopped')
      expect(pauseMock).toHaveBeenCalled()
      expect(audioFile.audioEl.currentTime).toBe(0)
    })
  })

  describe('loadAudio', () => {
    it('should not set src if file does not exist', () => {
      mockedFileExists.mockReturnValue(false)
      const audioFile = new AudioFile(app, 'missing.mp3')
      expect(audioFile.audioEl.src).toBe('')
    })

    it('should not set src if readFile returns null', () => {
      mockedFileExists.mockReturnValue(true)
      mockedReadFile.mockReturnValue(null)
      const audioFile = new AudioFile(app, 'test.mp3')
      expect(audioFile.audioEl.src).toBe('')
    })
  })
})
