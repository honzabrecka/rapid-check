const rng = require('./rng')

const { intoArray, map } = require('./core')

const { shrink } = require('./shrink')

const { rvalue, rchildren } = require('./rosetree')

const defaultSampleCount = 10

const defaultForAllCount = 100

const timestamp = () => +new Date()

function* sampleGen(seed, gen, count = defaultSampleCount) {
  const r = rng(seed)
  for (let i = 0; i < count; i++)
    yield gen(r, Math.floor(i / 2) + 1)
}

const sample = (gen, count = defaultSampleCount) =>
  intoArray(map(rvalue), sampleGen(timestamp(), gen, count))

const shrinkTupleToMap = ([tree, attempts, shrinks]) => ({
  min: rvalue(tree),
  attempts,
  shrinks,
})

async function shrinkFailing(tree, prop) {
  let reduced = [tree, 0, 0]

  for await (const [result, node] of shrink(rchildren(tree), prop)) {
    reduced = [
      result ? reduced[0] : node,
      reduced[1] + 1,
      reduced[2] + (result ? 0 : 1)
    ]
  }

  return reduced
}

const forAll = async (gen, prop, { count, seed } = {}) => {
  seed = seed || timestamp()
  const samples = sampleGen(seed, gen, count || defaultForAllCount)

  for (const sample of samples) {
    const value = rvalue(sample)
    if (!await prop(value))
      return {
        success: false,
        seed,
        shrink: shrinkTupleToMap(await shrinkFailing(sample, prop)),
        fail: value,
      }
  }

  return { success: true, seed }
}

module.exports = {
  sample,
  sampleGen,
  forAll,
}
