// type RoseTree T = [value: T, children: () -> Array (RoseTree T)]
const RoseTree = (value, children) => [value, children]

const rvalue = ([value, _]) => value

const rchildren = ([_, children]) => children

const toRoseTrees = (col, f) =>
  col.map((v) => RoseTree(v, () => f(v)))

function roseify(f) {
  const roseified = (...args) => toRoseTrees(
    f.apply(null, args),
    (value) => roseified.apply(null, [value].concat(args.slice(1)))
  )
  return roseified
}

const fmap = (f, [value, children]) => RoseTree(
  f(value),
  () => children().map((child) => fmap(f, child))
)

module.exports = {
  RoseTree,
  rvalue,
  rchildren,
  toRoseTrees,
  roseify,
  fmap,
}
