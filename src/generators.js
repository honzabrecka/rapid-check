const rosetree = require('./rosetree')

const shrink = require('./shrink')

const constantly = (value) => (_, __) => [value, () => []]

const choose = (min, max, center = min) => (rng, _) => {
  const n = rng(min, max)
  return [n, () => shrink.int(n, center)]
}

const int = (rng, size) => choose(-size, size)(rng, size)

const uint = (rng, size) => choose(0, size)(rng, size)

const fmap = (f, gen) => (rng, size) => rosetree.fmap(f, gen(rng, size))

const tuple = (...gens) => (rng, size) => {
  const elements = gens.map((gen) => gen(rng, size))
  return [
    elements.map((tree) => tree.root),
    () => shrink.tuple(elements)
  ]
}

module.exports = {
  constantly,
  choose,
  int,
  uint,
  //
  tuple,
  //
  fmap,
}
