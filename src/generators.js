const rosetree = require('./rosetree')

const { RoseTree, rvalue } = rosetree

const shrink = require('./shrink')

const constantly = (value) => (_rng, _size) => RoseTree(value, () => [])

const choose = (min, max, center = min) => (rng, _size) => {
  const n = rng(min, max)
  return RoseTree(n, () => shrink.int(n, center))
}

const int = (rng, size) => choose(-size, size)(rng, size)

const uint = (rng, size) => choose(0, size)(rng, size)

const fmap = (f, gen) => (rng, size) => rosetree.fmap(f, gen(rng, size))

const mbind = (gen, f) => (rng, size) => rosetree.mbind(
  gen(rng, size),
  (value) => f(value)(rng, size)
)

const tuple = (...gens) => (rng, size) => {
  const elements = gens.map((gen) => gen(rng, size))
  return RoseTree(
    elements.map(rvalue),
    () => shrink.tuple(elements)
  )
}

const oneOf = (...gens) => mbind(
  choose(0, gens.length - 1),
  (i) => gens[i]
)

module.exports = {
  constantly,
  choose,
  int,
  uint,
  //
  tuple,
  oneOf,
  //
  fmap,
  mbind,
}
