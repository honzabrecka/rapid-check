const rng = require('./rng')

const {
  reduce,
  transduce,
  intoArray,
  identity,
  map,
  takeWhile,
  comp
} = require('./core')

const { shrink } = require('./shrink')

const defaultSampleCount = 10

const defaultForAllCount = 100

function* sampleG(rng, gen, count = defaultSampleCount) {
  for (let i = 0; i < count; i++)
    yield gen(rng, Math.floor(i / 2) + 1)
}

const sample = (gen, count = defaultSampleCount) =>
  intoArray(identity, sampleG(rng(), gen, count))

function shrinkFailing(tree, prop) {
  return reduce(
    ([reduced, [lastFailingNode, attempts, shrinks]], [result, node]) =>
      [reduced, [
        result ? lastFailingNode : node,
        attempts + 1,
        shrinks + (result ? 0 : 1)
      ]],
    [tree, 0, 0]
  )(shrink(tree[1], prop))
}

const forAll = (gen, prop, count = defaultForAllCount) => transduce(
  comp(
    map((sample) => [prop(sample[0]), sample]),
    map(([result, sample]) => [result, result ? sample : shrinkFailing(sample, prop)]),
    takeWhile(([result, _]) => result === true, true)
  ),
  ([prevResult, _], [currentResult, sample]) => [prevResult && currentResult, sample],
  [true, null],
  sampleG(rng(), gen, count)
)

module.exports = {
  sample,
  forAll,
}
