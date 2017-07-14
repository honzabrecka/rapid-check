// type RoseTree T = [value: T, children: () -> Array (RoseTree T)]
const RoseTree = (value, children) => [value, children]

const rvalue = ([value, _]) => value

const rchildren = ([_, children]) => children

const fmap = (f, [value, children]) => RoseTree(
  f(value),
  () => children().map((child) => fmap(f, child))
)

module.exports = {
  RoseTree,
  rvalue,
  rchildren,
  fmap,
}
