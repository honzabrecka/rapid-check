const {
  inc
} = require('../core')

const {
  rng,
  sample,
  forAll
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
  it('gen.constantly', () => {
    const foo = { foo: 'bar' }
    const samples = sample(rng, constantly(foo))
    samples.forEach((value) =>
      expect(value).toBe(foo))
  })

  it('gen.choose', () => {
    const samples = sample(rng, choose(1, 3))
    const s = new Set([1, 2, 3])
    samples.forEach((value) =>
      expect(s.has(value)).toBe(true))
  })

  it('gen.int', () => {
    const samples = sample(rng, int)
    samples.forEach((value) =>
      expect(Number.isInteger(value)).toBe(true))
  })

  it('gen.uint', () => {
    const samples = sample(rng, uint)
    samples.forEach((value) =>
      expect(Number.isInteger(value) && value >= 0).toBe(true))
  })

  it('gen.fmap', () => {
    const f = (n) => -n
    const samples = sample(rng, fmap(f, uint))
    samples.forEach((value) =>
      expect(Number.isInteger(value) && value <= 0).toBe(true))
  })

  it('gen.bool', () => {
    const bools = new Set([true, false])
    const samples = sample(rng, bool)
    samples.forEach((value) =>
      expect(bools.has(value)).toBe(true))
  })
})

describe('forAll preserves gen type', () => {
  it('gen.constantly type', () => {
    const foo = { foo: 'bar' }
    const prop = (v) => v === foo
    const [result, _] = forAll(constantly(foo), prop)
    expect(result).toBe(true)
  })

  it('gen.choose type', () => {
    const s = new Set([1, 2, 3])
    const prop = (v) => s.has(v)
    const [result, _] = forAll(choose(1, 3), prop)
    expect(result).toBe(true)
  })

  it('gen.int type', () => {
    const prop = (v) => Number.isInteger(v)
    const [result, _] = forAll(int, prop)
    expect(result).toBe(true)
  })

  it('gen.uint type', () => {
    const prop = (v) => Number.isInteger(v) && v >= 0
    const [result, _] = forAll(uint, prop)
    expect(result).toBe(true)
  })

  it('gen.tuple type', () => {
    const s1 = new Set([1, 2, 3])
    const s2 = new Set([5, 6])
    const prop = ([a, b]) => s1.has(a) && s2.has(b)
    const [result, _] = forAll(tuple(choose(1, 3), choose(5, 6)), prop)
    expect(result).toBe(true)
  })

  it('gen.fmap type', () => {
    const prop = (v) => Number.isInteger(v) && v <= 0
    const [result, _] = forAll(fmap(negate, uint), prop)
    expect(result).toBe(true)
  })
})

describe('forAll shrinking', () => {
  it('gen.constantly shrinking', () => {
    const foo = { foo: 'bar' }
    const prop = (v) => v === 'whatever'
    const [result, [[value, _], attempts, shrinks]] = forAll(constantly(foo), prop)
    expect(result).toBe(false)
    expect(value).toBe(foo)
    // expect(attempts).toBe(0)
    // expect(shrinks).toBe(0)
  })

  it('gen.choose shrinking', () => {
    const prop = (v) => v < 8
    const [result, [[value, _], attempts, shrinks]] = forAll(choose(1, 10), prop)
    expect(result).toBe(false)
    expect(value).toBe(8)
    // expect(attempts).toBe(3)
    // expect(shrinks).toBe(0)
  })

  it('gen.int shrinking', () => {
    const prop = (v) => v < 8
    const [result, [[value, _], attempts, shrinks]] = forAll(int, prop)
    expect(result).toBe(false)
    expect(value).toBe(8)
    // expect(attempts).toBe(10)
    // expect(shrinks).toBe(1)
  })

  it('gen.uint shrinking', () => {
    const prop = (v) => v < 8
    const [result, [[value, _], attempts, shrinks]] = forAll(uint, prop)
    expect(result).toBe(false)
    expect(value).toBe(8)
    // expect(attempts).toBe(4)
    // expect(shrinks).toBe(0)
  })

  it('gen.tuple(gen.uint) shrinking', () => {
    const prop = ([a]) => a < 29
    const [result, [[value, _], attempts, shrinks]] = forAll(tuple(uint), prop)
    expect(result).toBe(false)
    expect(value).toEqual([29])
    // expect(attempts).toBe(4)
    // expect(shrinks).toBe(0)
  })

  it('gen.tuple(gen.uint, gen.uint) shrinking', () => {
    const prop = ([a, b]) => !(a >= 9 && b >= 12)
    const [result, [[value, _], attempts, shrinks]] = forAll(tuple(uint, uint), prop)
    expect(result).toBe(false)
    expect(value).toEqual([9, 12])
    // expect(attempts).toBe(4)
    // expect(shrinks).toBe(0)
  })

  it('gen.tuple(gen.uint, gen.uint) shrinking', () => {
    const prop = ([a, _]) => a < 29
    const [result, [[value, _], attempts, shrinks]] = forAll(tuple(uint, uint), prop)
    expect(result).toBe(false)
    expect(value).toEqual([29, 0])
    // expect(attempts).toBe(4)
    // expect(shrinks).toBe(0)
  })

  it('gen.tuple(gen.uint, gen.uint) shrinking', () => {
    const prop = ([_, b]) => b < 29
    const [result, [[value, _], attempts, shrinks]] = forAll(tuple(uint, uint), prop)
    expect(result).toBe(false)
    expect(value).toEqual([0, 29])
    // expect(attempts).toBe(4)
    // expect(shrinks).toBe(0)
  })

  it('gen.choose(gen.tuple(gen.fmap(gen.uint)) shrinking', () => {
    const prop = ([a]) => a > -29
    const [result, [[value, _], attempts, shrinks]] = forAll(tuple(negative), prop)
    expect(result).toBe(false)
    expect(value).toEqual([-29])
    // expect(attempts).toBe(4)
    // expect(shrinks).toBe(0)
  })

  it('gen.fmap shrinking', () => {
    const prop = (v) => v > -28
    const [result, [[value, _], attempts, shrinks]] = forAll(negative, prop)
    expect(result).toBe(false)
    expect(value).toBe(-28)
    // expect(attempts).toBe(9)
    // expect(shrinks).toBe(1)
  })

  it('gen.fmap shrinking', () => {
    const prop = (v) => v > -598325
    const [result, [[value, _], attempts, shrinks]] = forAll(negative, prop, 2000000)
    expect(result).toBe(false)
    expect(value).toBe(-598325)
    // expect(attempts).toBe(9)
    // expect(shrinks).toBe(1)
  })

  it('gen.oneOf shrinking', () => {
    const prop = (v) => v < 29
    const [result, [[value, _], attempts, shrinks]] = forAll(oneOf(negative, negative, uint), prop)
    expect(result).toBe(false)
    expect(value).toBe(29)
    // expect(attempts).toBe(9)
    // expect(shrinks).toBe(1)
  })

  it('gen.oneOf shrinking', () => {
    const prop = (v) => {
      if (v.length !== 3) return true
      const [a, b, c] = v
      return !(a >= 29 && b >= 43 && c>= 7)
    }
    const [result, [[value, _], attempts, shrinks]] = forAll(oneOf(
      tuple(negative, negative, negative),
      tuple(uint, negative),
      tuple(uint, uint, uint),// <-
      tuple(uint)
    ), prop, 500)
    expect(result).toBe(false)
    expect(value).toEqual([29, 43, 7])
    // expect(attempts).toBe(9)
    // expect(shrinks).toBe(1)
  })
})
