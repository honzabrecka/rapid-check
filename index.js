const random = require('random-js')

//-----------------------------
// fns lib
//-----------------------------

function* range(min, max) {
  for (let i = min; i <= max; i++)
    yield i
}

function map(f) {
  return (reducer) =>
    (prev, current) =>
      reducer(prev, f(current))
}

function filter(f) {
  return (reducer) =>
    (prev, current) =>
      f(current) ? reducer(prev, current) : prev
}

function take(n) {
  return (reducer) => {
    let taken = 0
    return ([reduced, prev], current) =>
      reducer([reduced || (++taken >= n), prev], current)
  }
}

function takeWhile(f) {
  return (reducer) => {
    return ([reduced, prev], current) => {
      reduced = reduced || !f(current)
      return reduced ? [reduced, prev] : reducer([reduced, prev], current)
    }
  }
}

function reduce(f, init) {
  return (col) => {
    let current
    let reduced = false
    let prev = init
    while (!reduced && !(current = col.next()).done)
      [reduced, prev] = f([reduced, prev], current.value)
    return prev
  }
}

const wrap = (f) => ([reduced, prev], current) => [reduced, f(prev, current)]

function transduce(xf, f, init, col) {
  return reduce(xf(wrap(f)), init)(col)
}

const comp = (...fns) => (v) => fns.reduceRight((r, f) => f(r), v)

const identity = (v) => v

const complement = (f) => (v) => !f(v)

const sum = (a, b) => a + b

const inc = (n) => n + 1

const even = (n) => n % 2 === 0

const odd = complement(even)

const tap = (f) => (v) => {
  f(v)
  return v
}

const conj = (col, v) => col.concat([v])

const intoArray = (xf, col) => transduce(xf, conj, [], col)

//-----------------------------
// rapid
//-----------------------------

const rt_fmap = (f, context) => new RoseTree(
  f(context.root),
  () => context.children().map((child) => rt_fmap(f, child))
)

class RoseTree {

  constructor(root, children) {
    this.root = root
    this.children = children
  }

  map(f) {
    return rt_fmap(f, this)
  }

}

const toRoseTrees = (col, f) =>
  col.map(el => new RoseTree(el, () => f(el)))

const roundTowardZero = (x) =>
  x < 0
    ? Math.ceil(x)
    : Math.floor(x)

function roseify(f) {
  const roseified = (...args) => toRoseTrees(
    f.apply(null, args),
    (value) => roseified.apply(null, [value].concat(args.slice(1)))
  )
  return roseified
}

const shrink = {
  int: roseify((n, center) => {
    const diff = (i) => (center - n) / Math.pow(2, i)
    return intoArray(
      comp(
        takeWhile((i) => Math.abs(diff(i)) >= 1),
        map((i) => n + roundTowardZero(diff(i))),
      ),
      range(0, Number.MAX_VALUE)
    )
  })
}

const choose = (min, max, center = min) => (rng, _) => {
  const n = rng(min, max)
  return new RoseTree(n, () => shrink.int(n, center))
}

const int = (rng, size) => choose(-size, size)(rng, size)

const fmap = (f, gen) => (rng, size) => gen(rng, size).map(f)


const gen = {
  choose,
  int,
  fmap,
}

const sample = (rng, gen, count = 10) =>
  intoArray(
    map((n) => gen(rng, Math.floor(n / 2) + 1)),
    range(0, count - 1)
  )


function* sampleG(rng, gen, count = 10) {
  for (let i = 0; i < count; i++)
    yield gen(rng, Math.floor(i / 2) + 1)
}


const engine = random.engines.mt19937()
engine.seed(9)

const rng = (min, max) => random.integer(min, max)(engine)

// console.log(sample(rng, gen.int, 100))

//////

function shrinkFailing(tree, prop) {
  //console.log(test.children())




}

function forAll(gen, prop, count = 100) {
  const samples = sample(rng, gen, count)

  for (let i = 0, v; i < samples.length; i++) {
    v = samples[i].root

    //console.log('v', samples[i])

    if (!prop(v)) {
      console.log('fail', v)
      shrinkFailing(samples[i], prop)
      return false
    }
  }

  return true
}

function forAllG(gen, prop, count = 100) {
  let current
  const samples = sampleG(rng, gen, count)
  while (!(current = samples.next()).done) {
    if (!prop(current.value)) {
      console.log('fail', current.value)
      shrinkFailing(current.value, prop)
      return false
    }
  }
  return true
}

module.exports = {
  range,
  map,
  filter,
  take,
  takeWhile,
  transduce,
  comp,
  conj,
  tap,
  identity,
  complement,
  even,
  odd,
  sum,
  inc,
  intoArray,
  gen,
  sample,
  shrink,
  shrinkFailing,
  forAll,
  roundTowardZero,
  toRoseTrees,
  RoseTree,
  sampleG,
  forAllG
}
