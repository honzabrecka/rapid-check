const {
  comp,
  intoArray,
  takeWhile,
  map,
  range
} = require('./core')

const { roseify, RoseTree } = require('./rosetree')

// type ShrinkResult T = [boolean, RoseTree T]
const ShrinkResult = (result, tree) => [result, tree]

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

function* shrink(nextChildren, prop) {
  let children = nextChildren()
  let i = 0
  let result
  let value

  while (i < children.length) {
    [value, nextChildren] = children[i]
    result = prop(value)

    if (result) {
      i++
    } else {
      i = 0
      children = nextChildren()
    }

    yield ShrinkResult(result, RoseTree(value, nextChildren))
  }
}

module.exports = {
  roundTowardZero,
  int,
  tuple,
  shrink,
}
