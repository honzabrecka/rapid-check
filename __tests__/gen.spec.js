const { forAllG, gen, tap, RoseTree } = require('../index')

describe('generators', () => {

  it('test', () => {
    const prop = jest.fn().mockReturnValue(true)
    expect(forAllG(gen.int, prop, 100)).toBe(true)
    expect(prop).toHaveBeenCalledTimes(100)
  })

})
