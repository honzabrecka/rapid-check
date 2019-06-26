const rng = require('../rng')

it('with default seed', () => {
  const r = rng()
  expect(r(0, 3)).toBe(2)
  expect(r(0, 3)).toBe(0)
  expect(r(0, 3)).toBe(2)
  expect(r(0, 3)).toBe(1)
  expect(r(0, 3)).toBe(2)
  expect(r(0, 3)).toBe(0)
  expect(r(0, 3)).toBe(3)
})

it('with custom seed', () => {
  const r = rng(256)
  expect(r(0, 3)).toBe(0)
  expect(r(0, 3)).toBe(2)
  expect(r(0, 3)).toBe(3)
  expect(r(0, 3)).toBe(1)
  expect(r(0, 3)).toBe(0)
  expect(r(0, 3)).toBe(1)
  expect(r(0, 3)).toBe(1)
})
