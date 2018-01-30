const {
  inc
} = require('../core')

const {
  rng,
  sample,
  asyncForAll
} = require('../check')

const {
  constantly,
  choose,
  int,
  uint,
  tuple,
  bool,
  oneOf,
  fmap
} = require('../generators')

const negate = (n) => -n

const negative = fmap(negate, uint)

describe('forAll preserves gen type', () => {
  it('gen.constantly type', async () => {
    const foo = { foo: 'bar' }
    const prop = (v) => Promise.resolve(v === foo)
    const { success } = await asyncForAll(constantly(foo), prop)
    expect(success).toBe(true)
  })
})

const d = (t, v) => new Promise((r) => {
  setTimeout(() => r(v), t)
})


jasmine.DEFAULT_TIMEOUT_INTERVAL = 5 * 60 * 1000

it('gen.fmap shrinking', async () => {
  const prop = (v) => d(10, v > -28)
  const { success, shrink: { min } } = await asyncForAll(negative, prop)
  expect(success).toBe(false)
  expect(min).toBe(-28)
})
