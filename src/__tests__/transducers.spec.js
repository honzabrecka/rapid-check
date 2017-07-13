const {
  range,
  reduce,
  transduce,
  intoArray,
  dorun,
  comp,
  map,
  filter,
  take,
  takeWhile,
  tap,
  identity,
  inc,
  even
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

describe('intoArray', () => {
  it('converts lazy generator into array', () => {
    expect(intoArray(identity, range(1, 3))).toEqual([1, 2, 3])
  })

  it('executes xf', () => {
    expect(intoArray(map(inc), range(1, 3))).toEqual([2, 3, 4])
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

describe('fns', () => {
  it('map', () => {
    expect(intoArray(map(inc), range(1, 3))).toEqual([2, 3, 4])
  })

  it('filter', () => {
    expect(intoArray(filter(even), range(1, 5))).toEqual([2, 4])
  })

  it('take', () => {
    expect(intoArray(take(2), range(1, 5))).toEqual([1, 2])
  })

  it('take ends reduction', () => {
    const f = jest.fn()
    const xf = comp(
      map(tap(f)),
      take(2)
    )
    intoArray(xf, range(1, 5))
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('takeWhile', () => {
    const e = (n) => n < 3
    expect(intoArray(takeWhile(e), range(1, 5))).toEqual([1, 2])
  })

  it('takeWhile, but include first non fitting value', () => {
    const e = (n) => n < 3
    expect(intoArray(takeWhile(e, true), range(1, 5))).toEqual([1, 2, 3])
  })

  it('takeWhile ends reduction', () => {
    const e = (n) => n < 3
    const f = jest.fn()
    const xf = comp(
      map(tap(f)),
      takeWhile(e)
    )
    intoArray(xf, range(1, 5))
    expect(f).toHaveBeenCalledTimes(3)
  })

  it('take and takeWhile respects reduced', () => {
    const e = (n) => n < 4
    const f = jest.fn()
    const xf = comp(
      map(tap(f)),
      take(2),
      takeWhile(e, true)
    )
    expect(intoArray(xf, range(1, 5))).toEqual([1, 2])
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('takeWhile and take respects reduced', () => {
    const e = (n) => n < 3
    const f = jest.fn()
    const xf = comp(
      map(tap(f)),
      takeWhile(e),
      take(4)
    )
    expect(intoArray(xf, range(1, 5))).toEqual([1, 2])
    expect(f).toHaveBeenCalledTimes(3)
  })
})
