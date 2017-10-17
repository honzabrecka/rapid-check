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

const { shrink, asyncShrink } = require('./shrink')

const defaultSampleCount = 10

const defaultForAllCount = 100

const timestamp = () => +new Date()

function* sampleG(rng, gen, count = defaultSampleCount) {
  for (let i = 0; i < count; i++)
    yield gen(rng, Math.floor(i / 2) + 1)
}

const sample = (gen, count = defaultSampleCount) =>
  intoArray(map(([v, _]) => v), sampleG(rng(timestamp()), gen, count))

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

async function asyncShrinkFailing(tree, prop) {
  const gen = asyncShrink(tree[1], prop)
  let current
  let result
  let reduced = [tree, 0, 0]
  let node

  while (!(current = gen.next()).done) {
    result = await current.value;
    [result, node] = gen.next(result).value

    reduced = [
      result ? reduced[0] : node,
      reduced[1] + 1,
      reduced[2] + (result ? 0 : 1)
    ]
  }

  return reduced
}

const forAll = (gen, prop, count = defaultForAllCount) => {
  const samples = sampleG(rng(timestamp()), gen, count)
  let sample
  let result

  while (!(sample = samples.next()).done) {
    sample = sample.value
    result = prop(sample[0])

    if (!result)
      return [false, shrinkFailing(sample, prop)]
  }

  return [true, sample]
}

const asyncForAll = async (gen, prop, count = defaultForAllCount) => {
  const samples = sampleG(rng(timestamp()), gen, count)
  let sample
  let result

  while (!(sample = samples.next()).done) {
    sample = sample.value
    result = await prop(sample[0])

    if (!result)
      return [false, await asyncShrinkFailing(sample, prop)]
  }

  return [true, sample]
}

module.exports = {
  sample,
  forAll,
  asyncForAll,
}
