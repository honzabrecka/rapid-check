const {
  ap,
  comp,
  identity,
  complement,
  tap,
  sum,
  inc,
  dec,
  odd,
  even,
  conj
} = require('../core')

it('applies args to function', () => {
  const f = (a, b, c) => a + b + c
  expect(ap(f, [1, 2, 3])).toBe(6)
})

it('comp executes fns from right', () => {
  expect(comp((n) => n * 4, (n) => n + 3)(2)).toBe(20)
})

it('identity', () => {
  const vs = [1, 'ab', false, [1], {foo: 'bar'}]
  expect(vs.reduce((r, v) => r && (identity(v) === v), true)).toBe(true)
})

it('complement', () => {
  expect(complement(identity)(true)).toBe(false)
})

describe('tap', () => {
  it('acts as identity', () => {
    const f = jest.fn()
    expect(tap(f)(5)).toBe(5)
  })

  it('acts as identity with side effect', () => {
    const f = jest.fn()
    tap(f)(5)
    expect(f).toHaveBeenCalledTimes(1)
    expect(f).toHaveBeenCalledWith(5)
  })
})

it('sum', () => {
  expect(sum(1, 2)).toBe(3)
})

it('inc', () => {
  expect(inc(1)).toBe(2)
})

it('dec', () => {
  expect(dec(2)).toBe(1)
})

describe('even', () => {
  it('with even number returns true', () => {
    expect(even(2)).toBe(true)
  })

  it('with non even number returns false', () => {
    expect(even(3)).toBe(false)
  })
})

describe('odd', () => {
  it('with odd number returns true', () => {
    expect(odd(3)).toBe(true)
  })

  it('with non odd number returns false', () => {
    expect(odd(2)).toBe(false)
  })
})

describe('conj', () => {
  it('empty array', () => {
    expect(conj([], 1)).toEqual([1])
  })

  it('non empty array', () => {
    expect(conj([1, 2], 3)).toEqual([1, 2, 3])
  })
})
