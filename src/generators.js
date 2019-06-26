const rosetree = require('./rosetree')
const shrink = require('./shrink')
const { RoseTree, rvalue } = rosetree

const ap = (f, args) => f.apply(null, args)

const constantly = value => (_rng, _size) => RoseTree(value, () => [])

const choose = (min, max, center = min) => (rng, _size) => {
  const n = rng(min, max)
  return RoseTree(n, () => shrink.int(n, center))
}

const int = (rng, size) => choose(-size, size)(rng, size)

const uint = (rng, size) => choose(0, size)(rng, size)

const fmap = (f, gen) => (rng, size) => rosetree.fmap(f, gen(rng, size))

const mbind = (f, gen) => (rng, size) =>
  rosetree.mbind(value => f(value)(rng, size), gen(rng, size))

const tuple = (...gens) => (rng, size) => {
  const elements = gens.map(gen => gen(rng, size))
  return RoseTree(elements.map(rvalue), () => shrink.tuple(elements))
}

const oneOf = (...gens) => mbind(i => gens[i], choose(0, gens.length - 1))

const bool = oneOf(constantly(true), constantly(false))

const array = (gen, min = 0, max = Number.MAX_VALUE) => (rng, size) =>
  mbind(
    count => ap(tuple, new Array(count).fill(gen)),
    choose(min, Math.min(max, size))
  )(rng, size)

module.exports = {
  constantly,
  choose,
  int,
  uint,
  bool,
  //
  tuple,
  array,
  oneOf,
  //
  fmap,
  mbind,
}
