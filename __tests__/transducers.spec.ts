import {
  AbortableReducer,
  comp,
  complement,
  even,
  filter,
  identity,
  inc,
  map,
  odd,
  range,
  sum,
  take,
  tap,
  transduce,
  intoArray,
} from '../index'

describe('lazy transducers', () => {

  it('even with even number', () => {
    expect(even(2)).toBe(true)
  })

  it('even with odd number', () => {
    expect(even(1)).toBe(false)
  })

  it('complement', () => {
    expect(complement(even)(2)).toBe(false)
  })

  it('comp', () => {
    expect(comp<number>(inc, inc)(1)).toBe(3)
  })

  it('range', () => {
    expect(transduce(identity, sum, 0, range(1, 3))).toBe(6)
  })

  it('transduce', () => {
    expect(transduce(map(inc), sum, 0, range(1, 3))).toBe(9)
  })

  it('transduce', () => {
    const xf = comp<AbortableReducer<number, number>>(filter(odd), map(inc))
    expect(transduce(xf, sum, 0, range(1, 3))).toBe(6)
  })

  it('transduce', () => {
    const mapper = jest.fn()
    const xf = comp<AbortableReducer<number, number>>(map(tap(mapper)), take(3))
    expect(transduce(xf, sum, 0, range(1, 10000))).toBe(6)
    expect(mapper).toHaveBeenCalledTimes(3)
  })

  it('intoArray', () => {
    expect(intoArray(range(1, 3))).toEqual([1, 2, 3])
  })

})
