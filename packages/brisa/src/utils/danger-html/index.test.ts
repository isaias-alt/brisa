import { describe, expect, it } from 'bun:test';
import dangerHTML from '.';

describe('danger-html', () => {
  it('should be transformed to "HTML" element', () => {
    const html = '<div>test</div>';
    const element = dangerHTML(html);

    expect(element).toEqual(
      Object.assign(['HTML', { html }, null], {
        [Symbol.for('isJSX')]: true,
      }) as any,
    );
  });
});
