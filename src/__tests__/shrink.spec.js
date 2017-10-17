const {
  roundTowardZero,
  int,
  tuple
} = require('../shrink')

const rng = require('../rng')

const gen = require('../generators')

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

const realize = (trees) => trees.map(([value, children]) => ({
  value,
  children: realize(children())
}))

it('int', () => {
  expect(realize(int(5, 0))).toMatchSnapshot()
})
