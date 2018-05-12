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

const timestamp = () => +new Date()

function* sampleG(rng, gen, count = defaultSampleCount) {
  for (let i = 0; i < count; i++)
    yield gen(rng, Math.floor(i / 2) + 1)
}

const sample = (gen, count = defaultSampleCount) =>
  intoArray(map(([v, _]) => v), sampleG(rng(timestamp()), gen, count))

const shrinkTupleToMap = ([[min, _], attempts, shrinks]) => ({
  min,
  attempts,
  shrinks,
})

async function shrinkFailing(tree, prop) {
  let reduced = [tree, 0, 0]

  for await (const [result, node] of shrink(tree[1], prop)) {
    reduced = [
      result ? reduced[0] : node,
      reduced[1] + 1,
      reduced[2] + (result ? 0 : 1)
    ]
  }

  return reduced
}

const forAll = async (gen, prop, { count, seed }= {}) => {
  seed = seed || timestamp()
  const samples = sampleG(rng(seed), gen, count || defaultForAllCount)
  let sample
  let result

  while (!(sample = samples.next()).done) {
    sample = sample.value
    result = await prop(sample[0])

    if (!result)
      return {
        success: false,
        seed,
        shrink: shrinkTupleToMap(await shrinkFailing(sample, prop)),
        fail: sample,
      }
  }

  return { success: true, seed }
}

module.exports = {
  sample,
  forAll,
}
