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
  fmap
} = require('../generators')

describe('sample', () => {
  it('gen.constantly', () => {
    const foo = { foo: 'bar' }
    const samples = sample(rng, constantly(foo))
    samples.forEach(([value, _]) =>
      expect(value).toBe(foo))
  })

  it('gen.choose', () => {
    const samples = sample(rng, choose(1, 3))
    const s = new Set([1, 2, 3])
    samples.forEach(([value, _]) =>
      expect(s.has(value)).toBe(true))
  })

  it('gen.int', () => {
    const samples = sample(rng, int)
    samples.forEach(([value, _]) =>
      expect(Number.isInteger(value)).toBe(true))
  })

  it('gen.uint', () => {
    const samples = sample(rng, uint)
    samples.forEach(([value, _]) =>
      expect(Number.isInteger(value) && value >= 0).toBe(true))
  })

  it('gen.fmap', () => {
    const f = (n) => -n
    const samples = sample(rng, fmap(f, uint))
    samples.forEach(([value, _]) =>
      expect(Number.isInteger(value) && value <= 0).toBe(true))
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
    const f = (n) => -n
    const prop = (v) => Number.isInteger(v) && v <= 0
    const [result, _] = forAll(fmap(f, uint), prop)
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

  it('gen.fmap shrinking', () => {
    const f = (n) => -n
    const prop = (v) => v > -28
    const [result, [[value, _], attempts, shrinks]] = forAll(fmap(f, uint), prop)
    expect(result).toBe(false)
    expect(value).toBe(-28)
    // expect(attempts).toBe(9)
    // expect(shrinks).toBe(1)
  })
})
