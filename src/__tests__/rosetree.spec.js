const {
  toRoseTrees,
  fmap
} = require('../rosetree')

const { inc } = require('../core')

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
