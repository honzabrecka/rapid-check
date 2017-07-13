const { forAll, gen, tap, RoseTree } = require('../index')

describe('generators', () => {

  it('test', () => {
    const prop = jest.fn().mockReturnValue(true)
    const [result, sample] = forAll(gen.int, prop, 100)
    expect(result).toBe(true)
    expect(sample).toBeInstanceOf(RoseTree)
    expect(prop).toHaveBeenCalledTimes(100)
  })

  it('test', () => {
    const prop = ([a, b]) => true
    const [result] = forAll(gen.tuple(gen.int, gen.int), prop)
    expect(result).toBe(true)
  })

  it('test shrinking', () => {
    const failingF = (a, b) => a > 5 && b > 4 ? 0 : 1
    const prop = ([a, b]) => failingF(a, b) === 1
    const [result, [sample]] = forAll(gen.tuple(gen.int, gen.int), prop)
    expect(result).toBe(false)
    expect(sample.root).toEqual([5, 4])
  })

})
