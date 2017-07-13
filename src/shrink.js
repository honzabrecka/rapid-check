const {
  comp,
  intoArray,
  takeWhile,
  map,
  range
} = require('./core')

const { roseify } = require('./rosetree')

const roundTowardZero = (x) =>
  x < 0
    ? Math.ceil(x)
    : Math.floor(x)

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
  roundTowardZero,
  int,
  tuple,
}
