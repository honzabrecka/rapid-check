const random = require('random-js')

const {
  intoArray,
  identity
} = require('./core')

const defaultSampleCount = 10

const defaultForAllCount = 100

function* sampleG(rng, gen, count = defaultSampleCount) {
  for (let i = 0; i < count; i++)
    yield gen(rng, Math.floor(i / 2) + 1)
}

const sample = (rng, gen, count = defaultSampleCount) =>
  intoArray(identity, sampleG(rng, gen, count))

const engine = random.engines.mt19937().seed(9)

const rng = (min, max) => random.integer(min, max)(engine)

function shrinkFailing(tree, prop) {
  function* s() {
    let children = tree.children()
    let i = 0
    let result
    let child

    while (i < children.length) {
      child = children[i]
      result = prop(child.root)// TODO memoize

      if (result) {
        i++
      } else {
        i = 0
        children = child.children()
      }

      yield [result, child]
    }
  }

  return reduce(
    ([reduced, [lastFailingNode, attempts, shrinks]], [result, node]) =>
      [reduced, [
        result ? lastFailingNode : node,
        attempts + 1,
        shrinks + (result ? 0 : 1)
      ]],
    [tree, 0, 0]
  )(s())
}

const forAll = (gen, prop, count = defaultForAllCount) => transduce(
  comp(
    map((sample) => [prop(sample.root), sample]),
    map(([result, sample]) => [result, result ? sample : shrinkFailing(sample, prop)]),
    takeWhile(([result, _]) => result === true, true)
  ),
  ([prevResult, _], [currentResult, sample]) => [prevResult && currentResult, sample],
  [true, null],
  sample(rng, gen, count)
)

module.exports = {
  sample,
  forAll,
}
