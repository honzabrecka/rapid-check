const { ap, repeat } = require('./core')
const rosetree = require('./rosetree')
const shrink = require('./shrink')
const { RoseTree, rvalue } = rosetree

const constantly = (value) => (_rng, _size) => RoseTree(value, () => [])

const choose = (min, max, center = min) => (rng, _size) => {
  const n = rng(min, max)
  return RoseTree(n, () => shrink.int(n, center))
}

const int = (rng, size) => choose(-size, size)(rng, size)

const uint = (rng, size) => choose(0, size)(rng, size)

const fmap = (f, gen) => (rng, size) => rosetree.fmap(f, gen(rng, size))

const mbind = (f, gen) => (rng, size) => rosetree.mbind(
  (value) => f(value)(rng, size),
  gen(rng, size)
)

const tuple = (...gens) => (rng, size) => {
  const elements = gens.map((gen) => gen(rng, size))
  return RoseTree(
    elements.map(rvalue),
    () => shrink.tuple(elements)
  )
}

const oneOf = (...gens) => mbind(
  (i) => gens[i],
  choose(0, gens.length - 1)
)

const bool = oneOf(constantly(true), constantly(false))

const consequence = (seq, id) => (rng, size) => {
  const $id = typeof id === 'function' ? id() : id
  const conseq = seq.reduce(([r, i, p], v) => {
    v = Array.isArray(v) ? consequenceN(v, $id) : v($id)
    return [
      r.concat([p.concat([v])]),
      i + 1,
      p.concat([v])
    ]
  }, [[[]], 0, []])[0]
  const m = conseq.map((s) => ap(tuple, s))
  return ap(oneOf, m)(rng, size)
}

const consequenceN = (seq, id) => mbind(
  (count) => ap(tuple, repeat(consequence(seq, id), count)),
  uint
)

const uuid = () => {
  let i = 0
  return () => {
    return i++
  }
}

module.exports = {
  constantly,
  choose,
  int,
  uint,
  bool,
  //
  tuple,
  oneOf,
  //
  fmap,
  mbind,
  //
  consequence,
  consequenceN,
  uuid,
}
