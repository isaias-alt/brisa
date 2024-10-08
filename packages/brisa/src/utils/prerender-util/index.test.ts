import { describe, it, expect } from 'bun:test';
import AST from '../ast';
import getPrerenderUtil from '.';
import { normalizeHTML } from '@/helpers';

const { parseCodeToAST, generateCodeFromAST } = AST('tsx');

describe('utils', () => {
  describe('getPrerenderUtil (renderOn="build")', () => {
    it('should not transform the ast if there is no renderOn="build"', () => {
      const code = `
				import Foo from '@/foo';

				export default function App() {
					return <Foo foo="bar" />;
				}
			`;
      const expectedCode = toExpected(`
				import Foo from '@/foo';

				export default function App() {
					return jsxDEV(Foo, {foo: "bar"}, undefined, false, undefined, this);
				}
			`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeFalse();
    });

    it('should only remove the attribute if there is renderOn="runtime"', () => {
      const code = `
				import Foo from '@/foo';

				export default function App() {
					return <Foo renderOn="runtime" foo="bar" />;
				}
			`;
      const expectedCode = toExpected(`
				import Foo from '@/foo';
				
				export default function App() {
					return jsxDEV(Foo, {foo: "bar"}, undefined, false, undefined, this);
				}`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeFalse();
    });
    it('should transform the ast to apply the prerender macro', () => {
      const code = `
				import Foo from '@/foo';

				export default function App() {
					return <Foo renderOn="build" foo="bar" />;
				}
			`;
      const expectedCode = normalizeHTML(`
				import {__prerender__macro} from 'brisa/macros' with { type: "macro" };
				import Foo from '@/foo';

				export default function App() {
					return __prerender__macro({
						componentPath: "@/foo",
						dir: "./foo",
						componentModuleName: "default",
						componentProps: {foo: "bar"}
					});
				}
			`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });

    it('should transform inside a fragment', () => {
      const code = `
				import Foo from '@/foo';

				export default function App() {
					return (
						<>
							<Foo renderOn="build" foo="bar" />
						</>
					);
				}
			`;
      const expectedCode = toExpected(`
				import {__prerender__macro} from 'brisa/macros' with { type: "macro" };
				import Foo from '@/foo';

				export default function App() {
					return jsxDEV(Fragment, {children: __prerender__macro({
							componentPath: "@/foo",
							dir: "./foo",
							componentModuleName: "default",
							componentProps: {foo: "bar"}
						})}, undefined, false, undefined, this
					);
				}
			`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });

    it('should transform a named export component', () => {
      const code = `
			import {Foo} from '@/foo';

			export default function App() {
				return (
					<Foo renderOn="build" foo="bar" />
				);
			}
		`;
      const expectedCode = toExpected(`
			import {__prerender__macro} from 'brisa/macros' with { type: "macro" };
			import {Foo} from '@/foo';

			export default function App() {
				return __prerender__macro({
					componentPath: "@/foo",
					dir: "./foo",
					componentModuleName: "Foo",
					componentProps: {foo: "bar"}
				});
			}
		`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });

    it('should transform a named export component with rename', () => {
      const code = `
		import {Foo as Foo2} from '@/foo';

		export default function App() {
			return (
				<Foo2 renderOn="build" foo="bar" />
			);
		}
	`;
      const expectedCode = toExpected(`
		import {__prerender__macro} from 'brisa/macros' with { type: "macro" };
		import {Foo as Foo2} from '@/foo';

		export default function App() {
			return __prerender__macro({
				componentPath: "@/foo",
				dir: "./foo",
				componentModuleName: "Foo",
				componentProps: {foo: "bar"}
			});
		}
	`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });

    it('should transform a named import with "require" component', () => {
      const code = `
			const {Foo} = require('@/foo');

			export default function App() {
				return (
					<Foo renderOn="build" foo="bar" />
				);
			}
		`;
      const expectedCode = toExpected(`
			import {__prerender__macro} from 'brisa/macros' with { type: "macro" };
			const {Foo} = require('@/foo');

			export default function App() {
				return __prerender__macro({
						componentPath: "@/foo",
						dir: "./foo",
						componentModuleName: "Foo",
						componentProps: {foo: "bar"}
				});
			}
		`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });

    it('should transform a named import with "require" component and renamed', () => {
      const code = `
			const {Foo: Foo2} = require('@/foo');

			export default function App() {
				return (
					<Foo2 renderOn="build" foo="bar" />
				);
			}
		`;
      const expectedCode = toExpected(`
			import {__prerender__macro} from 'brisa/macros' with { type: "macro" };
			const {Foo: Foo2} = require('@/foo');

			export default function App() {
				return __prerender__macro({
					componentPath: "@/foo",
					dir: "./foo",
					componentModuleName: "Foo",
					componentProps: {foo: "bar"}
				});
			}
		`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });

    it('should transform a named import with "require" component without destructuring', () => {
      const code = `
			const Foo = require('@/foo').Foo;

			export default function App() {
				return (
					<Foo renderOn="build" foo="bar" />
				);
			}
		`;
      const expectedCode = toExpected(`
			import {__prerender__macro} from 'brisa/macros' with { type: "macro" };
			const Foo = require('@/foo').Foo;

			export default function App() {
				return __prerender__macro({
						componentPath: "@/foo",
						dir: "./foo",
						componentModuleName: "Foo",
						componentProps: {foo: "bar"}
				});
			}
		`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });

    it('should transform a default import with "require" component', () => {
      const code = `
			const Foo = require('@/foo').default;

			export default function App() {
				return (
					<div>
						<Foo renderOn="build" foo="bar" />
					</div>
				);
			}
		`;
      const expectedCode = toExpected(`
			import {__prerender__macro} from 'brisa/macros' with { type: "macro" };
			const Foo = require('@/foo').default;

			export default function App() {
				return jsxDEV("div", {children: __prerender__macro({
							componentPath: "@/foo",
							dir: "./foo",
							componentModuleName: "default",
							componentProps: {foo: "bar"}
					})}, undefined, false, undefined, this
				);
			}
		`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });

    it('should detect _Brisa_SSRWebComponent and add the componentPath correctly without having an import', () => {
      const code = `
		import Foo from '@/foo';

		export default function App() {
			return (
				<div>
					<_Brisa_SSRWebComponent ssr-Component={Foo} ssr-selector="web-component" renderOn="build" foo="bar" />
				</div>
			);
		}
	`;
      const expectedCode = toExpected(`
		import {__prerender__macro} from 'brisa/macros' with { type: "macro" };
		import Foo from '@/foo';

		export default function App() {
			return jsxDEV("div", {children: __prerender__macro({
					componentPath: "brisa/server",
					dir: "./foo",
					componentModuleName: "SSRWebComponent",
					componentProps: {'ssr-Component': '@/foo','ssr-selector': "web-component",foo: "bar"}
				})}, undefined, false, undefined, this
			);
		}
	`);

      const output = getOutput(code);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });

    it('should detect _Brisa_SSRWebComponent and add the componentPath correctly without having any import', () => {
      const code = `
		export default function App() {
			return (
				<div>
					<_Brisa_SSRWebComponent ssr-Component={Foo} ssr-selector="web-component" renderOn="build" foo="bar" />
				</div>
			);
		}
	`;
      const expectedCode = toExpected(`
		import {__prerender__macro} from 'brisa/macros' with { type: "macro" };

		export default function App() {
			return jsxDEV("div", {children: __prerender__macro({
					componentPath: "brisa/server",
					dir: "./foo",
					componentModuleName: "SSRWebComponent",
					componentProps: {'ssr-Component': '@/foo','ssr-selector': "web-component",foo: "bar"}
				})}, undefined, false, undefined, this
			);
		}
	`);

      const webComponents = new Map<string, string>([['@/foo', 'Foo']]);

      const output = getOutput(code, webComponents);
      expect(output.code).toEqual(expectedCode);
      expect(output.prerendered).toBeTrue();
    });
  });
});

function getOutput(code: string, webComponents?: Map<string, string>) {
  const ast = parseCodeToAST(code);
  const p = getPrerenderUtil();
  const newAst = JSON.parse(
    JSON.stringify(ast, (k, v) =>
      p.step1_modifyJSXToPrerenderComponents(k, v, webComponents, './foo'),
    ),
  );

  p.step2_addPrerenderImport(newAst);

  return {
    code: normalizeHTML(generateCodeFromAST(newAst)),
    prerendered: p.usePrerender,
  };
}

function toExpected(code: string) {
  return normalizeHTML(code);
}
