const {
  toRoseTrees,
  fmap
} = require('../rosetree')

const { inc } = require('../core')

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

it('fmap', () => {
  const tree = [1, () => [
    [5, () => []]
  ]]
  const mappedTree = fmap(inc, tree)
  // root value
  expect(mappedTree[0]).toEqual(2)
  // first child value
  expect(mappedTree[1]()[0][0]).toEqual(6)
})
