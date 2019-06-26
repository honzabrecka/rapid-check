// type RoseTree T = [value: T, children: () -> Array (RoseTree T)]
const RoseTree = (value, children) => [value, children]

const rvalue = ([value, _]) => value

const rchildren = ([_, children]) => children

const fmap = (f, [value, children]) =>
  RoseTree(f(value), () => children().map(child => fmap(f, child)))

const flatten = ([[value, innerChildren], children]) =>
  RoseTree(value, () =>
    children()
      .map(flatten)
      .concat(innerChildren())
  )

const mbind = (f, tree) => flatten(fmap(f, tree))

module.exports = {
  RoseTree,
  rvalue,
  rchildren,
  fmap,
  mbind,
}
