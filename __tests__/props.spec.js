const { even, gen, forAll, inc } = require('../index')

const toString = (a) => a + ''

const endsWith = (...chs) => (n) => {
  const s = toString(n)
  return new Set(chs.map(toString)).has(s.charAt(s.length - 1))
}

const failingInc = (n) =>  n + (Math.abs(n) >= 500 ? 2 : 1)

describe('props', () => {

  it('endsWith', () => {
    expect(endsWith(0, 2)(102)).toBe(true)
    expect(endsWith(0, 2)(3)).toBe(false)
  })

  it('even', () => {
    expect(forAll(gen.int, (n) => even(n) === endsWith(0, 2, 4, 6, 8)(n))[0]).toBe(true)
  })

  it('inc', () => {
    const [result, sample] = forAll(gen.int, (n) => inc(n) > n)
    expect(result).toBe(true)
  })

  it('inc', () => {
    const [result, sample] = forAll(gen.int, (n) => inc(n) - n === 1)
    expect(result).toBe(true)
  })

  it('failingInc', () => {
    const prop = (n) => failingInc(n) - n === 1
    const [result, _] = forAll(gen.uint, prop, 1000)
    expect(result).toBe(false)
  })

})
