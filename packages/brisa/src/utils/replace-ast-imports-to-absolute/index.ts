import type { ESTree } from 'meriyah';
import { logError } from '@/utils/log/log-build';
import resolveImportSync from '@/utils/resolve-import-sync';

const EXCEPTIONS = new Set(['brisa/macros']);

/**
 * It is necessary when we create entrypoints on the fly during compilation,
 * for example for server actions, in this case files are created based on
 * others inside the build/actions folder and then compiled in another process.
 */
export default function replaceAstImportsToAbsolute(
  ast: ESTree.Program,
  path: string,
) {
  function replacer(key: string, value: any) {
    try {
      // "import something from '../some/path'" => "import something from '/absolute/some/path'"
      if (
        value?.type === 'ImportDeclaration' &&
        !EXCEPTIONS.has(value.source.value)
      ) {
        value.source.value = resolveImportSync(value.source.value, path);
      }

      // "require('../some/path')" => "require('/absolute/some/path')"
      if (
        value?.callee?.name === 'require' &&
        value?.arguments?.[0]?.type === 'Literal' &&
        !EXCEPTIONS.has(value.arguments[0].value)
      ) {
        value.arguments = [
          {
            type: 'Literal',
            value: resolveImportSync(value.arguments[0].value, path),
          },
        ];
      }

      // "import('../some/path')" => "import('/absolute/some/path')"
      if (
        value?.type === 'ImportExpression' &&
        value?.source?.type === 'Literal' &&
        !EXCEPTIONS.has(value.source.value)
      ) {
        value.source.value = resolveImportSync(value.source.value, path);
      }
    } catch (error) {
      logError({
        messages: ['Error resolving import path:', (error as Error).message],
      });
    }

    return value;
  }

  return JSON.parse(JSON.stringify(ast, replacer));
}
