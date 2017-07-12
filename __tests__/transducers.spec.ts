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
  takeWhile,
} from '../index'

const lessThan = (b: number) => (a: number) => a < b

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
    const xf = comp<AbortableReducer>(filter(odd), map(inc))
    expect(transduce(xf, sum, 0, range(1, 3))).toBe(6)
  })

  it('transduce', () => {
    const mapper = jest.fn()
    const xf = comp<AbortableReducer>(map(tap(mapper)), take(3))
    expect(transduce(xf, sum, 0, range(1, 10000))).toBe(6)
    expect(mapper).toHaveBeenCalledTimes(3)
  })

  it('intoArray', () => {
    expect(intoArray(identity, range(1, 3))).toEqual([1, 2, 3])
  })

  it('intoArray', () => {
    expect(intoArray(map(inc), range(1, 3))).toEqual([2, 3, 4])
  })

  it('takeWhile', () => {
    expect(intoArray(takeWhile(lessThan(3)), range(1, 10))).toEqual([1, 2])
  })

  it('once reduced, always reduced', () => {
    const take5 = take(5)
    const takeWhileLessThan3 = takeWhile(lessThan(3))
    const expected = [1, 2]

    expect(intoArray(comp<any>(take5, takeWhileLessThan3), range(1, 10))).toEqual(expected)
    expect(intoArray(comp<any>(takeWhileLessThan3, take5), range(1, 10))).toEqual(expected)
  })

})
