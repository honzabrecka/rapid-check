// type RoseTree T = [value: T, children: T -> Array (RoseTree T)]

const toRoseTrees = (col, f) =>
  col.map((v) => [v, () => f(v)])

function roseify(f) {
  const roseified = (...args) => toRoseTrees(
    f.apply(null, args),
    (value) => roseified.apply(null, [value].concat(args.slice(1)))
  )
  return roseified
}

const fmap = (f, [value, children]) => [
  f(value),
  () => children().map((child) => fmap(f, child))
]

module.exports = {
  toRoseTrees,
  roseify,
  fmap,
}
