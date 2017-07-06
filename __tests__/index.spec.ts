import { RoseTree, roundTowardZero, shrink, toRoseTrees } from '../index'

describe('roundTowardZero', () => {

  it('rounds to 0 when x < 0', () => {
    expect(roundTowardZero(-0.4)).toBe(0)
    expect(roundTowardZero(-2.1)).toBe(-2)
  })

  it('rounds to 0 when x >= 0', () => {
    expect(roundTowardZero(0.4)).toBe(0)
    expect(roundTowardZero(0.6)).toBe(0)
    expect(roundTowardZero(1.7)).toBe(1)
  })

})

describe('toRoseTrees', () => {

  const [a, b] = toRoseTrees([1, 2], (x) => x)

  it('toRoseTrees', () => {
    expect(a.root).toBe(1)
    expect(b.root).toBe(2)
  })

  it('toRoseTrees', () => {
    expect(a.children()).toBe(1)
    expect(b.children()).toBe(2)
  })

})

function realize(rts: RoseTree[]) {
  return rts.map(rt => ({ root: rt.root, children: realize(rt.children()) }))
}

describe('shrink', () => {

  it('tests generated rose tree', () => {
    const rts = shrink.int(5, 0)

    expect(realize(rts)).toMatchSnapshot()
    //expect(r.map(rt => rt.children())).toEqual({})
  })

})
