const {
  comp,
  intoArray,
  takeWhile,
  map,
  range
} = require('./core')

const toRoseTrees = (col, f) =>
  col.map((v) => [v, () => f(v)])

const roundTowardZero = (x) =>
  x < 0
    ? Math.ceil(x)
    : Math.floor(x)

const roseify = (f) => {
  const roseified = (...args) => toRoseTrees(
    f.apply(null, args),
    (value) => roseified.apply(null, [value].concat(args.slice(1)))
  )
  return roseified
}

const int = roseify((n, center) => {
  const diff = (i) => (center - n) / Math.pow(2, i)
  return intoArray(
    comp(
      takeWhile((i) => Math.abs(diff(i)) >= 1),
      map((i) => n + roundTowardZero(diff(i))),
    ),
    range(0, Number.MAX_VALUE)
  )
})

const tuple = roseify((trees) => {
  return []
})

module.exports = {
  toRoseTrees,
  roundTowardZero,
  int,
  tuple,
}
