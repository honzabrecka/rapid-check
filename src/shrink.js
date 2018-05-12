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
  const toRoseTrees = (values, f) =>
    values.map((value) => RoseTree(value, () => f(value)))

  const roseified = (...args) => toRoseTrees(
    f.apply(null, args),
    (value) => roseified.apply(null, [value].concat(args.slice(1)))
  )
  return roseified
}

const int = roseify((n, center) => {
  let diff = center - n
  let result = []

  while (Math.abs(diff) >= 1) {
    result.push(n + roundTowardZero(diff))
    diff = diff * 0.5
  }

  return result
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

async function* shrink(nextChildren, prop) {
  let children = nextChildren()
  let i = 0
  let result
  let value

  while (i < children.length) {
    [value, nextChildren] = children[i]
    result = await prop(value)

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
