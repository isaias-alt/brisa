---
description: Learn how to use the testing API in Brisa
---

# Testing API

Brisa exposes a testing API that extends the Bun test runner with custom APIs to streamline the testing process. These APIs are designed to simplify the testing of Brisa components and their behavior.

## `render`

Renders a Brisa component into a container and returns a set of actions to interact with the component.

Example:

```tsx
import { render } from "brisa/test";
import { test, expect } from "bun:test";

function Button() {
  return <button onClick={() => console.log("clicked")}>Click me</button>;
}

test("component", async () => {
  const { container } = await render(<Button />);
  const button = container.querySelector("button");

  expect(button).toHaveTextContent("Click me");
});
```

The second argument are the options to render the component:

- `baseElement`: The element where the component will be rendered. By default, it uses the `document.documentElement`.
- `locale`: The locale to use when rendering the component when using [i18n](/building-your-application/routing/internationalization). By default, it uses the `defaultLocale`.

Example:

```tsx
import { render } from "brisa/test";
import { test, expect } from "bun:test";
import { Component } from "./Component";

test("component", async () => {
  const baseElement = document.createElement("div");
  await render(<Component />, { baseElement, locale: "es" });

  expect(baseElement.querySelector("button")).toHaveTextContent("Clica aquí");
});
```

Types:

```ts
render(element: JSX.Element | Response | string, options?: {
  baseElement?: HTMLElement;
  locale?: string;
}): Promise<{
  container: HTMLElement;
  unmount: () => void;
  store: ReactiveMap;
}>;
```

### `container`

The container where the component is rendered.

### `unmount`

Unmounts the component from the container.

Example:

```tsx
import { render } from "brisa/test";
import { test, expect } from "bun:test";

test("unmount", async () => {
  const { container, unmount } = await render(<button>Click me</button>);
  expect(container.querySelector("button")).toBeInTheDocument();
  unmount();
  expect(container.querySelector("button")).not.toBeInTheDocument();
});
```

### `store`

The `store` from [`WebContext`](/api-reference/components/web-context) is useful for modifying the store to test how web components react to changes in it.

Example:

```tsx
import { render } from "brisa/test";
import { test, expect } from "bun:test";

test("store", async () => {
  const { container, store } = await render(<counter-example />);
  const counter = container.querySelector("counter-example")?.shadowRoot;

  expect(counter).toHaveTextContent("0");

  store.set("count", 1);

  expect(counter).toHaveTextContent("1");
});
```

## `serveRoute`

Request a Brisa route and return the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response). These routes can be API endpoints, pages, assets, or any other type of route.

Example:

```tsx
import { serveRoute } from "brisa/test";
import { test, expect } from "bun:test";

test("route", async () => {
  const response = await serveRoute("/api/hello");
  const data = await response.json();

  expect(data).toEqual({ message: "Hello, world!" });
});
```

For the pages, you can use it with the `render` function to render the page:

```tsx
import { render, serveRoute } from "brisa/test";
import { test, expect } from "bun:test";

test("page", async () => {
  const response = await serveRoute("/about");
  const { container } = await render(response);

  expect(container).toHaveTextContent("About us");
});
```

> [!TIP]
>
> You can use `render` after `serveRoute` to render the page and interact with it, and you can pass the `response` or the `response.text()` directly to the `render` function.

Types:

```ts
serveRoute(route: string): Promise<Response>;
```

## `cleanup`

Cleans up the document after each test.

Example:

```tsx
import { cleanup } from "brisa/test";
import { afterEach } from "bun:test";

afterEach(() => {
  cleanup();
});
```

Types:

```ts
cleanup(): void;
```

## `userEvent`

Simulates user events on a target element.

Example:

```tsx
import { render, userEvent } from "brisa/test";
import { test, expect } from "bun:test";

test("user event", async () => {
  const { container } = await render(<button>Click me</button>);
  const button = container.querySelector("button");

  userEvent.click(button); // Simulate a click event
});
```

Each method simulates a different user event:

- `click`: Simulates a click event.
  ```js
  userEvent.click(button);
  ```
- `dblClick`: Simulates a double click event.
  ```js
  userEvent.dblClick(button);
  ```
- `submit`: Simulates a submit event.
  ```js
  userEvent.submit(form);
  ```
- `type`: Simulates typing text into an input.
  ```js
  userEvent.type(input, "Hello, world!");
  ```
- `keyboard`: Simulates pressing a key.
  ```js
  userEvent.keyboard("Enter");
  ```
- `hover`: Simulates hovering over an element.
  ```js
  userEvent.hover(element);
  ```
- `unhover`: Simulates unhovering an element.
  ```js
  userEvent.unhover(element);
  ```
- `focus`: Simulates focusing on an element.
  ```js
  userEvent.focus(input);
  ```
- `blur`: Simulates blurring an element.
  ```js
  userEvent.blur(input);
  ```
- `select`: Simulates selecting an option from a dropdown.
  ```js
  userEvent.select(select, "option-1");
  ```
- `deselect`: Simulates deselecting an option from a dropdown.
  ```js
  userEvent.deselect(select, "option-1");
  ```
- `upload`: Simulates uploading a file.
  ```js
  userEvent.upload(input, file);
  ```
- `clear`: Simulates clearing an input.
  ```js
  userEvent.clear(input);
  ```
- `tab`: Simulates pressing the tab key.
  ```js
  userEvent.tab();
  ```
- `paste`: Simulates pasting text into an input.
  ```js
  userEvent.paste(input, "Hello, world!");
  ```

Types:

```ts
type userEvent = {
  click(element: Element): void;
  dblClick(element: Element): void;
  submit(element: HTMLFormElement): void;
  type(element: HTMLInputElement, text: string): void;
  keyboard(key: string, element?: HTMLElement): void;
  hover(element: Element): void;
  unhover(element: Element): void;
  focus(element: Element): void;
  blur(element: Element): void;
  select(element: HTMLSelectElement, value: string): void;
  deselect(element: HTMLSelectElement, value: string): void;
  upload(element: HTMLInputElement, file: File): void;
  clear(element: HTMLInputElement): void;
  tab(): void;
  paste(element: Element, text: string): void;
};
```

## `waitFor`

Waits for a condition to be true before continuing with the test. This is useful when you need to wait for an element to be visible, for example, when testing animations or asynchronous behavior.

Example:

```tsx
import { render, waitFor } from "brisa/test";
import { test, expect } from "bun:test";

test("wait for", async () => {
  const { container } = await render(<button>Click me</button>);
  const button = container.querySelector("button");

  await waitFor(() => expect(button).toBeVisible());
});
```

> [!TIP]
>
> You can use `waitFor` to wait for an element to be visible, to have a specific text content, or to have a specific class name.

Types:

```ts
async function waitFor(
  fn: () => unknown,
  maxMilliseconds: number,
): Promise<void>;
```

## `debug`

Prints the HTML of the rendered component to the console in a readable format.

Example:

```tsx
import { render, debug } from "brisa/test";
import { test, expect } from "bun:test";

test("debug a specific element", async () => {
  const { container } = await render(<button>Click me</button>);
  debug(container);
});
```

If no element is passed, it will debug the entire document.

Example:

```tsx
import { debug, render, serveRoute } from "brisa/test";
import { test } from "bun:test";

test("debug all the document", async () => {
  const pageResponse = await serveRoute("/about");
  await render(pageResponse);

  debug(); // Debug the entire document
});
```

In the console, you will see the HTML of the document in a readable format:

```html
<html>
  <body>
    <button>Click me</button>
  </body>
</html>
```

Types:

```ts
debug(element?: HTMLElement | DocumentFragment | ShadowRoot | null): void;
```
