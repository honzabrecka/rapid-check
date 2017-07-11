import * as random from 'random-js'

//-----------------------------
// rapid
//-----------------------------

export class RoseTree {

  constructor(public root: number, public children: Function) {}

}


export interface RNG {
  (min: number, max: number): number
}

export interface G {
  (rng: RNG, size: number): RoseTree
}

export const toRoseTrees = (col: any[], f: Function): RoseTree[] =>
  col.map(el => new RoseTree(el, () => f(el)))

export const roundTowardZero = (x: number): number =>
  x < 0
    ? Math.ceil(x)
    : Math.floor(x)

function roseify(f: Function) {
  const roseified = (...args: any[]) => toRoseTrees(
    f.apply(null, args),
    (value: any) => roseified.apply(null, [value].concat(args.slice(1)))
  )
  return roseified
}

export const shrink = {
  int: roseify((n: number, center: number): number[] => {
    let diff: number = center - n
    const out: number[] = []
    while (Math.abs(diff) >= 1) {
      out.push(n + roundTowardZero(diff))
      diff = diff / 2
    }
    return out
  })
}

const choose = (min: number, max: number, center: number = min): G => (rng, _) => {
  const n = rng(min, max)
  return new RoseTree(n, () => shrink.int(n, center))
}

const int: G = (r, size) => choose(-size, size)(r, size)

export const gen = {
  choose,
  int
}

export function sample(rng: RNG, gen: G, count = 10) {
  const results = new Array(count)

  for (let i = 0; i < count; i++) {
    results[i] = gen(rng, Math.floor(i / 2) + 1)
  }

  return results
}

const engine = random.engines.mt19937()
engine.seed(9)

const rng: RNG = (min: number, max: number): number => random.integer(min, max)(engine)

//console.log(sample(r, gen.int, 100))

//////

function shrinkFailing(test: RoseTree, prop: Function) {
  console.log(test.children())




}

function forAll(gen: G, prop: Function) {
  const samples = sample(rng, gen, 0)

  for (let i = 0, v: any; i < samples.length; i++) {
    v = samples[i].root

    //console.log('v', v)

    if (!prop(v)) {
      console.log('fail', v)
      shrinkFailing(samples[i], prop)
      break
    }
  }
}

forAll(gen.int, (v: number) => v < 40)


//-----------------------------
// fns lib
//-----------------------------

export type Pair<A, B> = [A, B]

export function* range(min: number, max: number) {
  for (let i = min; i <= max; i++)
    yield i
}

export interface Reducer<A, B> {
  (prev: B, current: A): B
}

export type AbortableReducer<A, B> = Reducer<A, Pair<boolean, B>>

export function map<A, B>(f: (v: A) => B) {
  return (reducer: AbortableReducer<A, B>): AbortableReducer<A, B> =>
    (prev, current) =>
      reducer(prev, f(current) as any)// TODODOODOOOOO!!!!!
}

export function filter<A, B>(f: (v: A) => boolean) {
  return (reducer: AbortableReducer<A, B>): AbortableReducer<A, B> =>
    (prev, current) =>
      f(current) ? reducer(prev, current) : prev
}

export function take<A, B>(n: number) {
  return (reducer: AbortableReducer<A, B>): AbortableReducer<A, B> => {
    let taken = 0
    return ([_, prev], current) =>
      reducer([++taken >= n, prev], current)
  }
}

function reduce<A, B>(f: AbortableReducer<A, B>, init: B) {
  return (col: IterableIterator<A>): B => {
    let current: IteratorResult<A>
    let reduced: boolean = false
    let prev = init
    while (!reduced && !(current = col.next()).done)
      [reduced, prev] = f([reduced, prev], current.value)
    return prev
  }
}

export function transduce<A, B>(xf: (f: AbortableReducer<A, B>) => AbortableReducer<A, B>, f: Reducer<A, B>, init: B) {
  const wrap = <A, B>(f: Reducer<A, B>): AbortableReducer<A, B> =>
    ([reduced, prev], current) => [reduced, f(prev, current)]

  return (col: IterableIterator<A>): B =>
    reduce(xf(wrap(f)), init)(col)
}

export const comp = <A>(...fns: Function[]) => (v: A): A =>
  fns.reduceRight((r, f) => f(r), v)

export const id = <T>(v: T) => v

export const complement = <A>(f: (v: A) => boolean) => (v: A) => !f(v)

export const sum = (a: number, b: number) => a + b

export const inc = (n: number) => n + 1

export const even = (n: number) => n % 2 === 0

export const odd = complement(even)

export const tap = <T>(f: Function) => (v: T) => {
  f(v)
  return v
}
