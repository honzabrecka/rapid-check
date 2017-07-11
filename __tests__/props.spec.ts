import { even, gen, forAll } from '../index'

const toString = (a: any) => a + ''

const endsWith = (...chs: any[]) => (n: any) => {
  const s = toString(n)
  return new Set(chs.map(toString)).has(s.charAt(s.length - 1))
}

describe('props', () => {

  it('endsWith', () => {
    expect(endsWith(0, 2)(102)).toBe(true)
    expect(endsWith(0, 2)(3)).toBe(false)
  })

  it('even', () => {
    expect(forAll(gen.int, (n: number) => even(n) === endsWith(0, 2, 4, 6, 8)(n))).toBe(true)
  })

})
