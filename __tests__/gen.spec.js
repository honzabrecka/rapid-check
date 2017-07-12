const { forAllG, sampleG, gen, tap } = require('../index')

describe('generators', () => {

  it('test', () => {
    const f = jest.fn()
    expect(forAllG(gen.int, (_) => tap(f)(true), 100)).toBe(true)
    expect(f).toHaveBeenCalledTimes(100)
  })

})
