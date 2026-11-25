import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  browserStorage,
  isTheme,
  nextTheme,
  readSavedTheme,
  saveTheme,
  themeToggleIcon,
  themeToggleLabel,
} from '../src/shared/lib/theme.ts'

// SIS 13 / I-01: regression tests for the 17 Nov redesign (dark/light theme, commit d979434).
const memoryStorage = (initial = {}) => {
  const data = { ...initial }
  return { data, getItem: key => (key in data ? data[key] : null), setItem: (key, value) => { data[key] = String(value) } }
}
const brokenStorage = {
  getItem: () => { throw new Error('storage blocked') },
  setItem: () => { throw new Error('storage blocked') },
}

test('TH-01 default theme is dark when nothing is saved', () => {
  assert.equal(DEFAULT_THEME, 'dark')
  assert.equal(readSavedTheme(memoryStorage()), 'dark')
  assert.equal(readSavedTheme(undefined), 'dark')
})

test('TH-02 a saved valid theme is restored after reload', () => {
  assert.equal(readSavedTheme(memoryStorage({ [THEME_STORAGE_KEY]: 'light' })), 'light')
  assert.equal(readSavedTheme(memoryStorage({ [THEME_STORAGE_KEY]: 'dark' })), 'dark')
})

test('TH-03 an invalid saved value falls back to the default', () => {
  for (const bad of ['', 'LIGHT', 'blue', 'null', ' dark ']) {
    assert.equal(readSavedTheme(memoryStorage({ [THEME_STORAGE_KEY]: bad })), 'dark')
  }
})

test('TH-04 toggling switches dark <-> light and twice returns to the start', () => {
  assert.equal(nextTheme('dark'), 'light')
  assert.equal(nextTheme('light'), 'dark')
  assert.equal(nextTheme(nextTheme('dark')), 'dark')
})

test('TH-05 the chosen theme is saved under the agreed key (persists on reload)', () => {
  const storage = memoryStorage()
  saveTheme(storage, 'light')
  assert.deepEqual(storage.data, { [THEME_STORAGE_KEY]: 'light' })
  assert.equal(readSavedTheme(storage), 'light')
})

test('TH-06 blocked storage never breaks the app', () => {
  assert.doesNotThrow(() => saveTheme(brokenStorage, 'light'))
  assert.doesNotThrow(() => saveTheme(undefined, 'light'))
  assert.equal(readSavedTheme(brokenStorage), 'dark')
  assert.doesNotThrow(() => browserStorage())
})

test('TH-07 toggle button shows the target mode (icon and accessible label)', () => {
  assert.equal(themeToggleIcon('dark'), 'sun')
  assert.equal(themeToggleIcon('light'), 'moon')
  assert.equal(themeToggleLabel('dark'), 'Switch to light mode')
  assert.equal(themeToggleLabel('light'), 'Switch to dark mode')
})

test('TH-08 only "dark" and "light" are accepted as themes', () => {
  assert.ok(isTheme('dark') && isTheme('light'))
  for (const bad of [undefined, null, 1, 'system', {}]) assert.equal(isTheme(bad), false)
})
