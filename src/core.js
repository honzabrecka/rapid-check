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

// TODO what with x, unify functionality
function takeWhile(f, x = false) {
  return (reducer) => {
    return ([reduced, prev], current) => {
      reduced = reduced || !f(current)
      return reduced && !x ? [reduced, prev] : reducer([reduced, prev], current)
    }
  }
}

const comp = (...fns) => (v) => fns.reduceRight((r, f) => f(r), v)

const identity = (v) => v

const complement = (f) => (v) => !f(v)

const tap = (f) => (v) => {
  f(v)
  return v
}

const sum = (a, b) => a + b

const inc = (n) => n + 1

const dec = (n) => n - 1

const even = (n) => n % 2 === 0

const odd = complement(even)

const conj = (col, v) => col.concat([v])

const reduce = (f, init) => (col) => {
  let current
  let reduced = false
  let prev = init
  while (!reduced && !(current = col.next()).done)
    [reduced, prev] = f([reduced, prev], current.value)
  return prev
}

const wrap = (f) => ([reduced, prev], current) => [reduced, f(prev, current)]

const transduce = (xf, f, init, col) => reduce(xf(wrap(f)), init)(col)

const intoArray = (xf, col) => transduce(xf, conj, [], col)

const dorun = (xf, col) => transduce(xf, identity, null, col)

module.exports = {
  range,
  map,
  filter,
  take,
  takeWhile,
  //
  reduce,
  transduce,
  intoArray,
  dorun,
  //
  comp,
  identity,
  complement,
  tap,
  //
  sum,
  inc,
  dec,
  even,
  odd,
  conj,
}
