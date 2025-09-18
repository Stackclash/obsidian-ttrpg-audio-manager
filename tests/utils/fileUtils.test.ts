/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, FileSystemAdapter } from 'obsidian'
import * as fileUtils from '../../src/utils/fileUtils'
import fs from 'fs'

jest.mock('fs')
const mockedFs = fs as jest.Mocked<typeof fs>

describe('fileUtils', () => {
  let app: App
  let adapter: FileSystemAdapter

  beforeEach(() => {
    adapter = {
      getBasePath: jest.fn(() => '/vault/base/path'),
    } as unknown as FileSystemAdapter

    app = {
      vault: {
        adapter,
      },
    } as unknown as App

    jest.clearAllMocks()
  })

  describe('getVaultPath', () => {
    it('returns base path when adapter is FileSystemAdapter', () => {
      expect(fileUtils.getVaultPath(app)).toBe('/vault/base/path')
    })

    it('returns empty string when adapter is not FileSystemAdapter', () => {
      app.vault.adapter = {} as any
      expect(fileUtils.getVaultPath(app)).toBe('')
    })
  })

  describe('getFullPath', () => {
    it('returns absolute path as is', () => {
      const absPath = '/absolute/path/file.txt'
      expect(fileUtils.getFullPath(app, absPath)).toBe(absPath)
    })

    it('joins vault path for relative path', () => {
      expect(fileUtils.getFullPath(app, 'relative/file.txt')).toBe(
        '/vault/base/path/relative/file.txt',
      )
    })
  })

  describe('fileExists', () => {
    it('returns true if fs.existsSync and fs.statSync indicate file exists', () => {
      mockedFs.existsSync.mockReturnValueOnce(true)
      mockedFs.statSync.mockReturnValueOnce({ isFile: () => true } as any)
      expect(fileUtils.fileExists(app, '/vault/base/path/file.txt')).toBe(true)
    })

    it('returns true if adapter is FileSystemAdapter and file exists at full path', () => {
      mockedFs.existsSync.mockReturnValueOnce(false)
      mockedFs.existsSync.mockReturnValueOnce(true)
      mockedFs.statSync.mockReturnValue({ isFile: () => true } as any)
      expect(fileUtils.fileExists(app, 'file.txt')).toBe(true)
    })

    it('returns false if file does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false)
      expect(fileUtils.fileExists(app, 'missing.txt')).toBe(false)
    })

    it('returns false if error is thrown', () => {
      mockedFs.existsSync.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(fileUtils.fileExists(app, 'error.txt')).toBe(false)
    })
  })

  describe('readFile', () => {
    it('returns Buffer if file exists and adapter is FileSystemAdapter', () => {
      jest.spyOn(fileUtils, 'fileExists').mockReturnValue(true)
      mockedFs.readFileSync.mockReturnValue(Buffer.from('data'))
      expect(fileUtils.readFile(app, 'file.txt')).toEqual(Buffer.from('data'))
    })

    it('returns null if file does not exist', () => {
      jest.spyOn(fileUtils, 'fileExists').mockReturnValue(false)
      expect(fileUtils.readFile(app, 'missing.txt')).toBeNull()
    })

    it('returns null if adapter is not FileSystemAdapter', () => {
      jest.spyOn(fileUtils, 'fileExists').mockReturnValue(true)
      app.vault.adapter = {} as any
      expect(fileUtils.readFile(app, 'file.txt')).toBeNull()
    })

    it('returns null if error is thrown', () => {
      jest.spyOn(fileUtils, 'fileExists').mockReturnValue(true)
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(fileUtils.readFile(app, 'file.txt')).toBeNull()
    })
  })
})
