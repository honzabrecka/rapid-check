const {
  rng,
  sample,
  forAll,
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

it('negates given number', () => {
  expect(negate(3)).toBe(-3)
  expect(negate(-3)).toBe(3)
})

describe('sample', () => {
  it('length', () => {
    const foo = { foo: 'bar' }
    const samples = sample(constantly(foo), 3)
    expect(samples).toEqual([foo, foo, foo])
  })

  it('gen.constantly', () => {
    const foo = { foo: 'bar' }
    const samples = sample(constantly(foo))
    samples.forEach((value) =>
      expect(value).toBe(foo))
  })

  it('gen.choose', () => {
    const samples = sample(choose(1, 3))
    const s = new Set([1, 2, 3])
    samples.forEach((value) =>
      expect(s.has(value)).toBe(true))
  })

  it('gen.int', () => {
    const samples = sample(int)
    samples.forEach((value) =>
      expect(Number.isInteger(value)).toBe(true))
  })

  it('gen.uint', () => {
    const samples = sample(uint)
    samples.forEach((value) =>
      expect(Number.isInteger(value) && value >= 0).toBe(true))
  })

  it('gen.fmap', () => {
    const samples = sample(fmap(negate, uint))
    samples.forEach((value) =>
      expect(Number.isInteger(value) && value <= 0).toBe(true))
  })

  it('gen.bool', () => {
    const bools = new Set([true, false])
    const samples = sample(bool)
    samples.forEach((value) =>
      expect(bools.has(value)).toBe(true))
  })
})

describe('forAll preserves gen type', () => {
  it('gen.constantly type', async () => {
    const foo = { foo: 'bar' }
    const prop = (v) => v === foo
    const { success } = await forAll(constantly(foo), prop)
    expect(success).toBe(true)
  })

  it('gen.choose type', async () => {
    const s = new Set([1, 2, 3])
    const prop = (v) => s.has(v)
    const { success } = await forAll(choose(1, 3), prop)
    expect(success).toBe(true)
  })

  it('gen.int type', async () => {
    const prop = (v) => Number.isInteger(v)
    const { success } = await forAll(int, prop)
    expect(success).toBe(true)
  })

  it('gen.uint type', async () => {
    const prop = (v) => Number.isInteger(v) && v >= 0
    const { success } = await forAll(uint, prop)
    expect(success).toBe(true)
  })

  it('gen.tuple type', async () => {
    const s1 = new Set([1, 2, 3])
    const s2 = new Set([5, 6])
    const prop = ([a, b]) => s1.has(a) && s2.has(b)
    const { success } = await forAll(tuple(choose(1, 3), choose(5, 6)), prop)
    expect(success).toBe(true)
  })

  it('gen.fmap type', async () => {
    const prop = (v) => Number.isInteger(v) && v <= 0
    const { success } = await forAll(fmap(negate, uint), prop)
    expect(success).toBe(true)
  })
})

describe('forAll (async prop) preserves gen type', () => {
  it('gen.constantly type', async () => {
    const foo = { foo: 'bar' }
    const prop = async (v) => v === foo
    const { success } = await forAll(constantly(foo), prop)
    expect(success).toBe(true)
  })

  it('gen.choose type', async () => {
    const s = new Set([1, 2, 3])
    const prop = async (v) => s.has(v)
    const { success } = await forAll(choose(1, 3), prop)
    expect(success).toBe(true)
  })

  it('gen.int type', async () => {
    const prop = async (v) => Number.isInteger(v)
    const { success } = await forAll(int, prop)
    expect(success).toBe(true)
  })

  it('gen.uint type', async () => {
    const prop = async (v) => Number.isInteger(v) && v >= 0
    const { success } = await forAll(uint, prop)
    expect(success).toBe(true)
  })

  it('gen.tuple type', async () => {
    const s1 = new Set([1, 2, 3])
    const s2 = new Set([5, 6])
    const prop = async ([a, b]) => s1.has(a) && s2.has(b)
    const { success } = await forAll(tuple(choose(1, 3), choose(5, 6)), prop)
    expect(success).toBe(true)
  })

  it('gen.fmap type', async () => {
    const prop = async (v) => Number.isInteger(v) && v <= 0
    const { success } = await forAll(fmap(negate, uint), prop)
    expect(success).toBe(true)
  })
})

describe('forAll shrinking', () => {
  it('gen.constantly shrinking', async () => {
    const foo = { foo: 'bar' }
    const prop = (v) => v === 'whatever'
    const { success, shrink: { min } } = await forAll(constantly(foo), prop)
    expect(success).toBe(false)
    expect(min).toBe(foo)
  })

  it('gen.choose shrinking', async () => {
    const prop = (v) => v < 8
    const { success, shrink: { min } } = await forAll(choose(1, 10), prop)
    expect(success).toBe(false)
    expect(min).toBe(8)
  })

  it('gen.int shrinking', async () => {
    const prop = (v) => v < 8
    const { success, shrink: { min } } = await forAll(int, prop)
    expect(success).toBe(false)
    expect(min).toBe(8)
  })

  it('gen.uint shrinking', async () => {
    const prop = (v) => v < 8
    const { success, shrink: { min } } = await forAll(uint, prop)
    expect(success).toBe(false)
    expect(min).toBe(8)
  })

  it('gen.tuple(gen.uint) shrinking', async () => {
    const prop = ([a]) => a < 29
    const { success, shrink: { min } } = await forAll(tuple(uint), prop)
    expect(success).toBe(false)
    expect(min).toEqual([29])
  })

  it('gen.tuple(gen.uint, gen.uint) shrinking', async () => {
    const prop = ([a, b]) => !(a >= 9 && b >= 12)
    const { success, shrink: { min } } = await forAll(tuple(uint, uint), prop)
    expect(success).toBe(false)
    expect(min).toEqual([9, 12])
  })

  it('gen.tuple(gen.uint, gen.uint) shrinking', async () => {
    const prop = ([a, _]) => a < 29
    const { success, shrink: { min } } = await forAll(tuple(uint, uint), prop)
    expect(success).toBe(false)
    expect(min).toEqual([29, 0])
  })

  it('gen.tuple(gen.uint, gen.uint) shrinking', async () => {
    const prop = ([_, b]) => b < 29
    const { success, shrink: { min } } = await forAll(tuple(uint, uint), prop)
    expect(success).toBe(false)
    expect(min).toEqual([0, 29])
  })

  it('gen.choose(gen.tuple(gen.fmap(gen.uint)) shrinking', async () => {
    const prop = ([a]) => a > -29
    const { success, shrink: { min } } = await forAll(tuple(negative), prop)
    expect(success).toBe(false)
    expect(min).toEqual([-29])
  })

  it('gen.fmap shrinking', async () => {
    const prop = (v) => v > -28
    const { success, shrink: { min } } = await forAll(negative, prop)
    expect(success).toBe(false)
    expect(min).toBe(-28)
  })

  it('gen.fmap shrinking', async () => {
    const prop = (v) => v > -598325
    const { success, shrink: { min } } = await forAll(negative, prop, { count: 2000000 })
    expect(success).toBe(false)
    expect(min).toBe(-598325)
  })

  it('gen.oneOf shrinking', async () => {
    const prop = (v) => v < 29
    const { success, shrink: { min } } = await forAll(oneOf(negative, negative, uint), prop)
    expect(success).toBe(false)
    expect(min).toBe(29)
  })

  it('gen.oneOf shrinking', async () => {
    const prop = (v) => {
      if (v.length !== 3) return true
      const [a, b, c] = v
      return !(a >= 29 && b >= 43 && c>= 7)
    }
    const { success, shrink: { min } } = await forAll(oneOf(
      tuple(negative, negative, negative),
      tuple(uint, negative),
      tuple(uint, uint, uint),// <-
      tuple(uint)
    ), prop, { count: 500 })
    expect(success).toBe(false)
    expect(min).toEqual([29, 43, 7])
  })
})

describe('forAll (async prop) shrinking', () => {
  it('gen.constantly shrinking', async () => {
    const foo = { foo: 'bar' }
    const prop = async (v) => v === 'whatever'
    const { success, shrink: { min } } = await forAll(constantly(foo), prop)
    expect(success).toBe(false)
    expect(min).toBe(foo)
  })

  it('gen.choose shrinking', async () => {
    const prop = async (v) => v < 8
    const { success, shrink: { min } } = await forAll(choose(1, 10), prop)
    expect(success).toBe(false)
    expect(min).toBe(8)
  })

  it('gen.int shrinking', async () => {
    const prop = async (v) => v < 8
    const { success, shrink: { min } } = await forAll(int, prop)
    expect(success).toBe(false)
    expect(min).toBe(8)
  })

  it('gen.uint shrinking', async () => {
    const prop = async (v) => v < 8
    const { success, shrink: { min } } = await forAll(uint, prop)
    expect(success).toBe(false)
    expect(min).toBe(8)
  })

  it('gen.tuple(gen.uint) shrinking', async () => {
    const prop = async ([a]) => a < 29
    const { success, shrink: { min } } = await forAll(tuple(uint), prop)
    expect(success).toBe(false)
    expect(min).toEqual([29])
  })

  it('gen.tuple(gen.uint, gen.uint) shrinking', async () => {
    const prop = async ([a, b]) => !(a >= 9 && b >= 12)
    const { success, shrink: { min } } = await forAll(tuple(uint, uint), prop)
    expect(success).toBe(false)
    expect(min).toEqual([9, 12])
  })

  it('gen.tuple(gen.uint, gen.uint) shrinking', async () => {
    const prop = async ([a, _]) => a < 29
    const { success, shrink: { min } } = await forAll(tuple(uint, uint), prop)
    expect(success).toBe(false)
    expect(min).toEqual([29, 0])
  })

  it('gen.tuple(gen.uint, gen.uint) shrinking', async () => {
    const prop = async ([_, b]) => b < 29
    const { success, shrink: { min } } = await forAll(tuple(uint, uint), prop)
    expect(success).toBe(false)
    expect(min).toEqual([0, 29])
  })

  it('gen.choose(gen.tuple(gen.fmap(gen.uint)) shrinking', async () => {
    const prop = async ([a]) => a > -29
    const { success, shrink: { min } } = await forAll(tuple(negative), prop)
    expect(success).toBe(false)
    expect(min).toEqual([-29])
  })

  it('gen.fmap shrinking', async () => {
    const prop = async (v) => v > -28
    const { success, shrink: { min } } = await forAll(negative, prop)
    expect(success).toBe(false)
    expect(min).toBe(-28)
  })

  it('gen.fmap shrinking', async () => {
    const prop = async (v) => v > -598325
    const { success, shrink: { min } } = await forAll(negative, prop, { count: 2000000 })
    expect(success).toBe(false)
    expect(min).toBe(-598325)
  })

  it('gen.oneOf shrinking', async () => {
    const prop = async (v) => v < 29
    const { success, shrink: { min } } = await forAll(oneOf(negative, negative, uint), prop)
    expect(success).toBe(false)
    expect(min).toBe(29)
  })

  it('gen.oneOf shrinking', async () => {
    const prop = async (v) => {
      if (v.length !== 3) return true
      const [a, b, c] = v
      return !(a >= 29 && b >= 43 && c>= 7)
    }
    const { success, shrink: { min } } = await forAll(oneOf(
      tuple(negative, negative, negative),
      tuple(uint, negative),
      tuple(uint, uint, uint),// <-
      tuple(uint)
    ), prop, { count: 500 })
    expect(success).toBe(false)
    expect(min).toEqual([29, 43, 7])
  })
})

describe('seed', () => {
  it('forAll (success)', async () => {
    const seedIn = 10
    const { success, seed } = await forAll(uint, (_) => true, { seed: seedIn })
    expect(success).toBe(true)
    expect(seed).toBe(seedIn)
  })

  it('forAll (fail)', async () => {
    const seedIn = 10
    const { success, seed } = await forAll(uint, (_) => false, { seed: seedIn })
    expect(success).toBe(false)
    expect(seed).toBe(seedIn)
  })
})
