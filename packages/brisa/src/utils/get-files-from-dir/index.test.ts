import { describe, it, expect } from 'bun:test';
import path from 'node:path';

import getFilesFromDir from '.';

const assetsPath = path.join(
  import.meta.dir,
  '..',
  '..',
  '__fixtures__',
  'public',
);

describe('utils', () => {
  describe('getFilesFromDir', () => {
    it('should return all files from a directory', async () => {
      const output = await getFilesFromDir(assetsPath);
      const expected = new Set([
        path.join(assetsPath, 'favicon.ico'),
        path.join(assetsPath, 'some-dir', 'some-img.png'),
        path.join(assetsPath, 'some-dir', 'some-text.txt'),
        path.join(assetsPath, 'some-dir', 'some-text.txt.br'),
        path.join(assetsPath, 'some-dir', 'some-text.txt.gz'),
        path.join(assetsPath, 'user', 'static.js'),
        path.join(assetsPath, 'user', 'static.js.br'),
        path.join(assetsPath, 'user', 'static.js.gz'),
      ]);

      expect(new Set(output)).toEqual(expected);
    });
  });
});
