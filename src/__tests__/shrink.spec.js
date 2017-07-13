const {
  toRoseTrees,
  roundTowardZero,
} = require('../shrink')


describe('roundTowardZero', () => {

  it('rounds to the smallest integer greater than or equal to a given x where x < 0', () => {
    expect(roundTowardZero(-0.4)).toBe(0)
    expect(roundTowardZero(-2.1)).toBe(-2)
  })

  it('rounds to the largest integer less than or equal to a given x where x >= 0', () => {
    expect(roundTowardZero(0.4)).toBe(0)
    expect(roundTowardZero(0.6)).toBe(0)
    expect(roundTowardZero(1.7)).toBe(1)
  })

})

describe('toRoseTrees', () => {

  const [a, b] = toRoseTrees([1, 2], (x) => x)

  it('toRoseTrees a', () => {
    const [value, children] = a
    expect(value).toBe(1)
    expect(children()).toBe(1)
  })

  it('toRoseTrees b', () => {
    const [value, children] = b
    expect(value).toBe(2)
    expect(children()).toBe(2)
  })

})
