import { describe, expect, it } from 'bun:test';
import type { ESTree } from 'meriyah';
import getReactiveReturnStatement from '.';
import { normalizeHTML } from '@/helpers';
import AST from '@/utils/ast';

const { parseCodeToAST, generateCodeFromAST } = AST();

describe('utils', () => {
  describe('client-build-plugin', () => {
    describe('get-reactive-return-statement', () => {
      it('should return the reactive return statement', () => {
        const program = parseCodeToAST(`
          const a = (props) => ['div', { foo: () => props.bar.value }, 'baz']
        `) as any;

        const component = program.body[0].declarations[0]
          .init as ESTree.FunctionDeclaration;

        const output = getReactiveReturnStatement(component, 'a');

        const expectedCode = normalizeHTML(
          `function a(props) {return ['div', {foo: () => props.bar.value}, 'baz'];}`,
        );

        expect(normalizeHTML(generateCodeFromAST(output as any))).toBe(
          expectedCode,
        );
      });

      it('should be reactive returning a variable', () => {
        const program = parseCodeToAST(`
          const a = (props) => {
            const foo = ['b', {}, () => props.bar.value];
            return foo;
          }
        `) as any;

        const component = program.body[0].declarations[0]
          .init as ESTree.FunctionDeclaration;
        const output = getReactiveReturnStatement(component, 'a');
        const expectedCode = normalizeHTML(`
          function a(props) {
            const foo = ['b', {}, () => props.bar.value];
            return () => foo;
          }
        `);

        expect(normalizeHTML(generateCodeFromAST(output as any))).toBe(
          expectedCode,
        );
      });
    });
  });
});
