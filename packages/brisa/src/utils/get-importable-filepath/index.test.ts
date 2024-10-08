import { describe, it, expect } from 'bun:test';
import path from 'node:path';
import getImportableFilepath from '.';
import { pathToFileURL } from 'node:url';

const dir = path.join(
  import.meta.dir,
  '..',
  '..',
  '__fixtures__',
  'files-to-detect',
);

describe('utils/getImportableFilepath', () => {
  describe('without file schema (Bun.js)', () => {
    it('should detect tsx-file.tsx', () => {
      const input = 'tsx-file';
      const output = getImportableFilepath(input, dir);
      const expected = path.join(dir, 'tsx-file.tsx');

      expect(output).toBe(expected);
    });

    it('should detect ts-file.ts', () => {
      const input = 'ts-file';
      const output = getImportableFilepath(input, dir);
      const expected = path.join(dir, 'ts-file.ts');

      expect(output).toBe(expected);
    });

    it('should detect js-file.js', () => {
      const input = 'js-file';
      const output = getImportableFilepath(input, dir);
      const expected = path.join(dir, 'js-file.js');

      expect(output).toBe(expected);
    });

    it('should detect tsx-folder-file.tsx', () => {
      const input = 'tsx-folder-file';
      const output = getImportableFilepath(input, dir);
      const expected = path.join(dir, 'tsx-folder-file/index.tsx');

      expect(output).toBe(expected);
    });

    it('should detect ts-folder-file.ts', () => {
      const input = 'ts-folder-file';
      const output = getImportableFilepath(input, dir);
      const expected = path.join(dir, 'ts-folder-file/index.ts');

      expect(output).toBe(expected);
    });

    it('should detect js-folder-file.js', () => {
      const input = 'js-folder-file';
      const output = getImportableFilepath(input, dir);
      const expected = path.join(dir, 'js-folder-file/index.js');

      expect(output).toBe(expected);
    });
  });

  describe('with file schema (Node.js)', () => {
    it('should detect tsx-file.tsx', () => {
      const input = 'tsx-file';
      const output = getImportableFilepath(input, dir, true);
      const expected = pathToFileURL(path.join(dir, 'tsx-file.tsx')).href;

      expect(output).toBe(expected);
    });

    it('should detect ts-file.ts', () => {
      const input = 'ts-file';
      const output = getImportableFilepath(input, dir, true);
      const expected = pathToFileURL(path.join(dir, 'ts-file.ts')).href;

      expect(output).toBe(expected);
    });

    it('should detect js-file.js', () => {
      const input = 'js-file';
      const output = getImportableFilepath(input, dir, true);
      const expected = pathToFileURL(path.join(dir, 'js-file.js')).href;

      expect(output).toBe(expected);
    });

    it('should detect tsx-folder-file.tsx', () => {
      const input = 'tsx-folder-file';
      const output = getImportableFilepath(input, dir, true);
      const expected = pathToFileURL(
        path.join(dir, 'tsx-folder-file/index.tsx'),
      ).href;

      expect(output).toBe(expected);
    });

    it('should detect ts-folder-file.ts', () => {
      const input = 'ts-folder-file';
      const output = getImportableFilepath(input, dir, true);
      const expected = pathToFileURL(
        path.join(dir, 'ts-folder-file/index.ts'),
      ).href;

      expect(output).toBe(expected);
    });

    it('should detect js-folder-file.js', () => {
      const input = 'js-folder-file';
      const output = getImportableFilepath(input, dir, true);
      const expected = pathToFileURL(
        path.join(dir, 'js-folder-file/index.js'),
      ).href;

      expect(output).toBe(expected);
    });
  });
});
