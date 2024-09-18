import { toInline } from '@/helpers';
import { Fragment as BrisaFragment } from '@/jsx-runtime';
import type { RequestContext } from '@/types';
import { getConstants } from '@/constants';

export const AVOID_DECLARATIVE_SHADOW_DOM_SYMBOL = Symbol.for(
  'AVOID_DECLARATIVE_SHADOW_DOM',
);

type Props = {
  Component: any;
  selector: string;
  [key: string]: any;
};

const voidFn = () => {};

export default async function SSRWebComponent(
  { Component, selector, __key, ...props }: Props,
  { store, useContext, i18n, indicate, route }: RequestContext,
) {
  const { WEB_CONTEXT_PLUGINS } = getConstants();
  const showContent = !store.has(AVOID_DECLARATIVE_SHADOW_DOM_SYMBOL);
  const self = { shadowRoot: {}, attachInternals: voidFn } as any;
  let style = '';
  const Selector = selector;

  // Note: For renderOn="build" we need to import the component inside
  // to execute the SSRWebComponent in a macro with serialized props.
  // Note: Should be an absolute path.
  if (typeof Component === 'string') {
    Component = await import(Component).then((m) => m.default);
  }

  // @ts-ignore
  store.setOptimistic = voidFn;

  const webContext = {
    store,
    self,
    state: (value: unknown) => ({ value }),
    effect: voidFn,
    onMount: voidFn,
    reset: voidFn,
    derived: (fn: () => unknown) => ({ value: fn() }),
    cleanup: voidFn,
    indicate,
    useContext,
    i18n,
    css: (template: TemplateStringsArray, ...values: string[]) => {
      style += String.raw(
        template,
        ...values.map((v: unknown) => (typeof v === 'function' ? v() : v)),
      );
    },
    route: {
      name: route?.name,
      pathname: route?.pathname,
      params: route?.params,
      query: route?.query,
    },
  } as unknown as RequestContext;

  for (const plugin of WEB_CONTEXT_PLUGINS) {
    // @ts-ignore
    Object.assign(webContext, plugin(webContext));
  }

  const componentProps = { ...props, children: <slot /> };
  let content: any;

  if (showContent) {
    try {
      content = await (typeof Component.suspense === 'function'
        ? Component.suspense(componentProps, webContext)
        : Component(componentProps, webContext));
    } catch (error) {
      if (Component.error) {
        content = await Component.error(
          { ...componentProps, error },
          webContext,
        );
      } else {
        throw error;
      }
    }
  }

  return (
    // @ts-ignore
    <Selector key={__key} {...props} __isWebComponent>
      {showContent && (
        <template
          shadowrootmode="open"
          // @ts-ignore
          __skipGlobalCSS={self.shadowRoot.adoptedStyleSheets?.length === 0}
        >
          {content}
          {style.length > 0 && <style>{toInline(style)}</style>}
        </template>
      )}
      {/* @ts-ignore */}
      <BrisaFragment slot="">{props.children}</BrisaFragment>
    </Selector>
  );
}

SSRWebComponent.__isWebComponent = true;
