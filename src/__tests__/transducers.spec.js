const {
  range,
  reduce,
  transduce,
  dorun,
  map,
  filter,
  take,
  takeWhile,
  tap,
  identity
} = require('../core')

describe('reduce', () => {
  it('calls reducer', () => {
    const f = jest.fn().mockReturnValue([false, 'whatever'])
    reduce(f, 'whatever')(range(1, 3))
    expect(f).toHaveBeenCalledTimes(3)
    expect(f).toHaveBeenCalledWith([false, 'whatever'], 1)
    expect(f).toHaveBeenCalledWith([false, 'whatever'], 2)
    expect(f).toHaveBeenCalledWith([false, 'whatever'], 3)
  })

  it('calls reducer until it\'s not reduced', () => {
    const f = jest.fn().mockReturnValue([true, 'whatever'])
    reduce(f, 'whatever')(range(1, 3))
    expect(f).toHaveBeenCalledTimes(1)
    expect(f).toHaveBeenCalledWith([false, 'whatever'], 1)
  })

  it('reduces given col', () => {
    const f = ([reduced, sum], n) => [reduced, sum + n]
    expect(reduce(f, 0)(range(1, 3))).toBe(6)
  })
})

describe('transduce', () => {
  it('acts as reduce when xf = identity', () => {
    const f = jest.fn().mockReturnValue('whatever')
    transduce(identity, f, 'whatever', range(1, 3))
    expect(f).toHaveBeenCalledTimes(3)
    expect(f).toHaveBeenCalledWith('whatever', 1)
    expect(f).toHaveBeenCalledWith('whatever', 2)
    expect(f).toHaveBeenCalledWith('whatever', 3)
  })
})

describe('dorun', () => {
  it('dorun returns always null', () => {
    expect(dorun(identity, range(1, 3))).toBe(null)
  })

  it('calls f', () => {
    const f = jest.fn()
    dorun(map(tap(f)), range(1, 3))
    expect(f).toHaveBeenCalledTimes(3)
    expect(f).toHaveBeenCalledWith(1)
    expect(f).toHaveBeenCalledWith(2)
    expect(f).toHaveBeenCalledWith(3)
  })
})
