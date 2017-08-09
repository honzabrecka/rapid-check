const { generate } = require('../consequence')

it('generates all possible consequences', () => {
  expect(generate([1, 2])).toEqual([
    [],
    [1],
    [1, 2]
  ])
  expect(generate([1, 2, 3])).toEqual([
    [],
    [1],
    [1, 2],
    [1, 2, 3]
  ])
  expect(generate([1, [2]])).toEqual([
    [],
    [1],
    [1, [
      [],
      [2]
    ]]
  ])
  expect(generate([1, [2, 3]])).toEqual([
    [],
    [1],
    [1, [
      [],
      [2],
      [2, 3]
    ]]
  ])
  expect(generate([1, [2, 3], 4])).toEqual([
    [],
    [1],
    [1, [
      [],
      [2],
      [2, 3]
    ]],
    [1, [
      [],
      [2],
      [2, 3]
    ], 4]
  ])
})
