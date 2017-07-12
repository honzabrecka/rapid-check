const { forAll, gen, tap, RoseTree } = require('../index')

describe('generators', () => {

  it('test', () => {
    const prop = jest.fn().mockReturnValue(true)
    const [result, sample] = forAll(gen.int, prop, 100)
    expect(result).toBe(true)
    expect(sample).toBeInstanceOf(RoseTree)
    expect(prop).toHaveBeenCalledTimes(100)
  })

})
