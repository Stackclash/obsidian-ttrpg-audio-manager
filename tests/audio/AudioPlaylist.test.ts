/* eslint-disable @typescript-eslint/no-explicit-any */
import AudioPlaylist from '../../src/audio/AudioPlaylist'
import AudioFile from '../../src/audio/AudioFile'
import { App } from 'obsidian'
import { PlaylistSettings } from '../../src/types'

jest.mock('../../src/audio/AudioFile')

describe('AudioPlaylist', () => {
  let app: App
  let audioPaths: string[]
  let playlist: AudioPlaylist

  beforeEach(() => {
    app = {} as App
    audioPaths = ['file1.mp3', 'file2.mp3']
    ;(AudioFile as jest.Mock).mockImplementation((app: App, path: string, volume: number) => ({
      app,
      path,
      volume,
      state: 'stopped',
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      stop: jest.fn(),
    }))
    playlist = new AudioPlaylist(app, 'Test Playlist', audioPaths, 0.5, false)
  })

  describe('constructor', () => {
    it('initializes properties correctly', () => {
      expect(playlist.name).toBe('Test Playlist')
      expect(playlist.loop).toBe(false)
      expect(playlist.volume).toBe(0.5)
      expect(playlist.audioFiles.length).toBe(2)
      expect(playlist.audioFiles[0].path).toBe('file1.mp3')
      expect(playlist.audioFiles[1].path).toBe('file2.mp3')
    })
  })

  describe('state', () => {
    it('returns "stopped" when all audio files are stopped', () => {
      expect(playlist.state).toBe('stopped')
    })

    it('returns the state of the first non-stopped audio file', () => {
      ;(playlist.audioFiles[1] as any).state = 'playing'
      expect(playlist.state).toBe('playing')
    })
  })

  describe('volume', () => {
    it('gets and sets volume', () => {
      playlist.volume = 0.8
      expect(playlist.volume).toBe(0.8)
      expect(playlist.audioFiles[0].volume).toBe(0.8)
      expect(playlist.audioFiles[1].volume).toBe(0.8)
    })
  })

  describe('getCurrentAudioIndex', () => {
    it('returns 0 when all audio files are stopped', () => {
      expect(playlist.getCurrentAudioIndex()).toBe(0)
    })

    it('returns index of first non-stopped audio file', () => {
      ;(playlist.audioFiles[1] as any).state = 'playing'
      expect(playlist.getCurrentAudioIndex()).toBe(1)
    })
  })

  describe('play', () => {
    it('plays first audio file if stopped', async () => {
      await playlist.play()
      expect(playlist.audioFiles[0].play).toHaveBeenCalled()
    })

    it('plays current audio file if paused', async () => {
      ;(playlist.audioFiles[1] as any).state = 'paused'
      jest.spyOn(playlist, 'getCurrentAudioIndex').mockReturnValue(1)
      await playlist.play()
      expect(playlist.audioFiles[1].play).toHaveBeenCalled()
    })
  })

  describe('pause', () => {
    it('pauses playing audio files', () => {
      ;(playlist.audioFiles[0] as any).state = 'playing'
      playlist.pause()
      expect(playlist.audioFiles[0].pause).toHaveBeenCalled()
      expect(playlist.audioFiles[1].pause).not.toHaveBeenCalled()
    })
  })

  describe('stop', () => {
    it('stops playing audio files', () => {
      ;(playlist.audioFiles[1] as any).state = 'playing'
      playlist.stop()
      expect(playlist.audioFiles[1].stop).toHaveBeenCalled()
      expect(playlist.audioFiles[0].stop).not.toHaveBeenCalled()
    })
  })

  describe('addAudioFile', () => {
    it('adds a new audio file', () => {
      playlist.addAudioFile('file3.mp3')
      expect(playlist.audioFiles.length).toBe(3)
      expect(playlist.audioFiles[2].path).toBe('file3.mp3')
    })
  })

  describe('removeAudioFileByPath', () => {
    it('removes audio file by path', () => {
      playlist.removeAudioFileByPath('file1.mp3')
      expect(playlist.audioFiles.length).toBe(1)
      expect(playlist.audioFiles[0].path).toBe('file2.mp3')
    })
  })

  describe('removeAudioFileByIndex', () => {
    it('removes audio file by index', () => {
      playlist.removeAudioFileByIndex(0)
      expect(playlist.audioFiles.length).toBe(1)
      expect(playlist.audioFiles[0].path).toBe('file2.mp3')
    })

    it('does nothing if index is out of bounds', () => {
      playlist.removeAudioFileByIndex(5)
      expect(playlist.audioFiles.length).toBe(2)
    })
  })

  describe('toJson', () => {
    it('returns correct PlaylistSettings object', () => {
      const json: PlaylistSettings = playlist.toJson()
      expect(json).toEqual({
        name: 'Test Playlist',
        volume: 0.5,
        loop: false,
        audioPaths: ['file1.mp3', 'file2.mp3'],
      })
    })
  })
})
