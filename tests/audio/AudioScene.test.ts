/* eslint-disable @typescript-eslint/no-explicit-any */
import AudioScene from '../../src/audio/AudioScene'
import AudioFile from '../../src/audio/AudioFile'
import { App } from 'obsidian'
import { SceneAudioSettings } from '../../src/types'

jest.mock('../../src/audio/AudioFile')

const mockApp = {} as App

const mockAudioSettings: SceneAudioSettings[] = [
  { audioPath: 'path1.mp3', volume: 0.5 },
  { audioPath: 'path2.mp3', volume: 0.8 },
]

describe('AudioScene', () => {
  let audioScene: AudioScene

  beforeEach(() => {
    ;(AudioFile as jest.Mock).mockClear()
    audioScene = new AudioScene(mockApp, 'Test Scene', mockAudioSettings)
  })

  describe('constructor', () => {
    it('should initialize with provided name and audio files', () => {
      expect(audioScene.name).toBe('Test Scene')
      expect(audioScene.audioFiles.length).toBe(2)
      expect(AudioFile).toHaveBeenCalledTimes(2)
    })
  })

  describe('state', () => {
    it('should return "stopped" if no audio files', () => {
      audioScene.audioFiles = []
      expect(audioScene.state).toBe('stopped')
    })

    it('should return the common state if all audio files have same state', () => {
      ;(audioScene.audioFiles[0] as any).state = 'playing'
      ;(audioScene.audioFiles[1] as any).state = 'playing'
      expect(audioScene.state).toBe('playing')
    })

    it('should return empty string if audio files have different states', () => {
      ;(audioScene.audioFiles[0] as any).state = 'playing'
      ;(audioScene.audioFiles[1] as any).state = 'paused'
      expect(audioScene.state).toBe('')
    })
  })

  describe('play', () => {
    it('should call play on all audio files if not already playing', async () => {
      ;(audioScene.audioFiles[0] as any).state = 'paused'
      ;(audioScene.audioFiles[1] as any).state = 'paused'
      const playMock0 = jest.fn().mockResolvedValue(undefined)
      const playMock1 = jest.fn().mockResolvedValue(undefined)
      audioScene.audioFiles[0].play = playMock0
      audioScene.audioFiles[1].play = playMock1

      await audioScene.play()
      expect(playMock0).toHaveBeenCalled()
      expect(playMock1).toHaveBeenCalled()
    })

    it('should not call play if already playing', async () => {
      ;(audioScene.audioFiles[0] as any).state = 'playing'
      ;(audioScene.audioFiles[1] as any).state = 'playing'
      const playMock0 = jest.fn()
      const playMock1 = jest.fn()
      audioScene.audioFiles[0].play = playMock0
      audioScene.audioFiles[1].play = playMock1

      await audioScene.play()
      expect(playMock0).not.toHaveBeenCalled()
      expect(playMock1).not.toHaveBeenCalled()
    })
  })

  describe('pause', () => {
    it('should call pause on all audio files if playing', () => {
      ;(audioScene.audioFiles[0] as any).state = 'playing'
      ;(audioScene.audioFiles[1] as any).state = 'playing'
      const pauseMock0 = jest.fn()
      const pauseMock1 = jest.fn()
      audioScene.audioFiles[0].pause = pauseMock0
      audioScene.audioFiles[1].pause = pauseMock1

      audioScene.pause()
      expect(pauseMock0).toHaveBeenCalled()
      expect(pauseMock1).toHaveBeenCalled()
    })

    it('should not call pause if not playing', () => {
      ;(audioScene.audioFiles[0] as any).state = 'paused'
      ;(audioScene.audioFiles[1] as any).state = 'paused'
      const pauseMock0 = jest.fn()
      const pauseMock1 = jest.fn()
      audioScene.audioFiles[0].pause = pauseMock0
      audioScene.audioFiles[1].pause = pauseMock1

      audioScene.pause()
      expect(pauseMock0).not.toHaveBeenCalled()
      expect(pauseMock1).not.toHaveBeenCalled()
    })
  })

  describe('stop', () => {
    it('should call stop on all audio files if playing', () => {
      ;(audioScene.audioFiles[0] as any).state = 'playing'
      ;(audioScene.audioFiles[1] as any).state = 'playing'
      const stopMock0 = jest.fn()
      const stopMock1 = jest.fn()
      audioScene.audioFiles[0].stop = stopMock0
      audioScene.audioFiles[1].stop = stopMock1

      audioScene.stop()
      expect(stopMock0).toHaveBeenCalled()
      expect(stopMock1).toHaveBeenCalled()
    })

    it('should not call stop if not playing', () => {
      ;(audioScene.audioFiles[0] as any).state = 'paused'
      ;(audioScene.audioFiles[1] as any).state = 'paused'
      const stopMock0 = jest.fn()
      const stopMock1 = jest.fn()
      audioScene.audioFiles[0].stop = stopMock0
      audioScene.audioFiles[1].stop = stopMock1

      audioScene.stop()
      expect(stopMock0).not.toHaveBeenCalled()
      expect(stopMock1).not.toHaveBeenCalled()
    })
  })

  describe('addAudioFile', () => {
    it('should add a new AudioFile to audioFiles', () => {
      audioScene.addAudioFile('path3.mp3', 0.7)
      expect(audioScene.audioFiles.length).toBe(3)
      expect(AudioFile).toHaveBeenCalledWith(mockApp, 'path3.mp3', 0.7)
    })
  })

  describe('removeAudioFileByPath', () => {
    it('should remove audio file with matching path', () => {
      ;(audioScene.audioFiles[0] as any).path = 'path1.mp3'
      ;(audioScene.audioFiles[1] as any).path = 'path2.mp3'
      audioScene.removeAudioFileByPath('path1.mp3')
      expect(audioScene.audioFiles.length).toBe(1)
      expect(audioScene.audioFiles[0].path).toBe('path2.mp3')
    })

    it('should not remove any audio file if path does not match', () => {
      ;(audioScene.audioFiles[0] as any).path = 'path1.mp3'
      ;(audioScene.audioFiles[1] as any).path = 'path2.mp3'
      audioScene.removeAudioFileByPath('notfound.mp3')
      expect(audioScene.audioFiles.length).toBe(2)
    })
  })

  describe('removeAudioFileByIndex', () => {
    it('should remove audio file at given index', () => {
      audioScene.removeAudioFileByIndex(0)
      expect(audioScene.audioFiles.length).toBe(1)
    })

    it('should not remove audio file if index is out of bounds', () => {
      audioScene.removeAudioFileByIndex(-1)
      expect(audioScene.audioFiles.length).toBe(2)
      audioScene.removeAudioFileByIndex(10)
      expect(audioScene.audioFiles.length).toBe(2)
    })
  })

  describe('toJson', () => {
    it('should return correct SceneSettings object', () => {
      ;(audioScene.audioFiles[0] as any).path = 'path1.mp3'
      ;(audioScene.audioFiles[0] as any).volume = 0.5
      ;(audioScene.audioFiles[1] as any).path = 'path2.mp3'
      ;(audioScene.audioFiles[1] as any).volume = 0.8
      const json = audioScene.toJson()
      expect(json).toEqual({
        name: 'Test Scene',
        audioSettings: [
          { audioPath: 'path1.mp3', volume: 0.5 },
          { audioPath: 'path2.mp3', volume: 0.8 },
        ],
      })
    })
  })
})
