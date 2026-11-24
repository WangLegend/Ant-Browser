import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const frontend_root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const test_dir = path.join(frontend_root, '.tag-input-test')
await mkdir(test_dir, { recursive: true })
await build({
  entryPoints: [path.join(frontend_root, 'src/modules/browser/components/TagInput.tsx')],
  outfile: path.join(test_dir, 'component.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  logLevel: 'silent',
})
const require = createRequire(import.meta.url)
const { TagInput: tag_input } = require(path.join(test_dir, 'component.cjs'))
const render_input = (value, suggestions = []) => renderToStaticMarkup(
  createElement(tag_input, { value, suggestions, onChange: () => {} }),
)

for (const empty_value of [null, undefined, []]) {
  test(`empty tag input renders without crashing: ${JSON.stringify(empty_value)}`, () => {
    const markup = render_input(empty_value)
    assert.match(markup, /<input/)
    assert.match(markup, /placeholder="输入标签后按回车"/)
  })
}

test('a saved tag is still rendered', () => {
  assert.match(render_input(['Gemini']), />Gemini</)
})

test('a null suggestion list does not crash the editor', () => {
  assert.match(render_input([], null), /<input/)
})
