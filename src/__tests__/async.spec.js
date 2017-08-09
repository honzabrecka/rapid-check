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

describe('forAll preserves gen type', () => {
  it('gen.constantly type', async () => {
    const foo = { foo: 'bar' }
    const prop = (v) => v === foo
    const [result, _] = await asyncForAll(constantly(foo), prop)
    expect(result).toBe(true)
  })
})
