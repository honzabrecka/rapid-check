const {
  comp,
  intoArray,
  takeWhile,
  map,
  range,
  conj
} = require('./core')

const { RoseTree, rvalue } = require('./rosetree')

// type ShrinkResult T = [boolean, RoseTree T]
const ShrinkResult = (result, tree) => [result, tree]

const roundTowardZero = (x) =>
  x < 0
    ? Math.ceil(x)
    : Math.floor(x)

function roseify(f) {
  const toRoseTrees = (col, f) =>
    col.map((v) => RoseTree(v, () => f(v)))

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

const splitAt = (col, index) => [
  col.slice(0, index),
  col.slice(index + 1)
]

const tuple = (trees) => {
  const toRoseTree = (f) => (col) => RoseTree(
    col.map(rvalue),
    () => f(col)
  )

  const [shrunkTrees] = trees.reduce(([shrunkTrees, index], [_, children]) => {
    const [a, b] = splitAt(trees, index)
    shrunkTrees = children().reduce((shrunkTrees, child) =>
      conj(shrunkTrees, a.concat([child]).concat(b)),
      shrunkTrees
    )
    return [shrunkTrees, index + 1]
  }, [[], 0])

  return shrunkTrees.map(toRoseTree(tuple))
}

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
