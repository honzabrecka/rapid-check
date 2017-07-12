import * as random from 'random-js'

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

export type AbortableReducer = Reducer<any, Pair<boolean, any>>

export function map<A, B>(f: (v: A) => B) {
  return (reducer: AbortableReducer): AbortableReducer =>
    (prev, current) =>
      reducer(prev, f(current) as any)
}

export function filter<A>(f: (v: A) => boolean) {
  return (reducer: AbortableReducer): AbortableReducer =>
    (prev, current) =>
      f(current) ? reducer(prev, current) : prev
}

export function take(n: number) {
  return (reducer: AbortableReducer): AbortableReducer => {
    let taken = 0
    return ([reduced, prev], current) =>
      reducer([reduced || (++taken >= n), prev], current)
  }
}

export function takeWhile<A>(f: (v: A) => boolean) {
  return (reducer: AbortableReducer): AbortableReducer => {
    return ([reduced, prev], current) => {
      reduced = reduced || !f(current)
      return reduced ? [reduced, prev] : reducer([reduced, prev], current)
    }
  }
}

function reduce<A, B>(f: AbortableReducer, init: B) {
  return (col: IterableIterator<A>): B => {
    let current: IteratorResult<A>
    let reduced: boolean = false
    let prev = init
    while (!reduced && !(current = col.next()).done)
      [reduced, prev] = f([reduced, prev], current.value)
    return prev
  }
}

const wrap = <A, B>(f: Reducer<A, B>): AbortableReducer =>
  ([reduced, prev], current) => [reduced, f(prev, current)]

export function transduce<A, B>(xf: (f: AbortableReducer) => AbortableReducer, f: Reducer<A, B>, init: B, col: IterableIterator<A>): B {
  return reduce(xf(wrap(f)), init)(col)
}

export const comp = <A>(...fns: Function[]) => (v: A): A =>
  fns.reduceRight((r, f) => f(r), v)

export const identity = <T>(v: T) => v

export const complement = <A>(f: (v: A) => boolean) => (v: A) => !f(v)

export const sum = (a: number, b: number) => a + b

export const inc = (n: number) => n + 1

export const even = (n: number) => n % 2 === 0

export const odd = complement(even)

export const tap = <T>(f: Function) => (v: T) => {
  f(v)
  return v
}

export const conj = <A>(col: A[], v: A): A[] =>
  col.concat([v])

export const intoArray = <A, B>(xf: (f: AbortableReducer) => AbortableReducer, col: IterableIterator<A>) =>
  transduce<A, B[]>(xf, conj, [], col)

//-----------------------------
// rapid
//-----------------------------

const rt_fmap = (f: Function, context: RoseTree): RoseTree => new RoseTree(
  f(context.root),
  () => context.children().map((child) => rt_fmap(f, child))
)

export class RoseTree {
  constructor(public root: number, public children: () => RoseTree[]) {}

  map(f: Function): RoseTree {
    return rt_fmap(f, this)
  }
}

export interface RNG {
  (min: number, max: number): number
}

export interface ShrinkableGenerator {
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
    const diff = (i: number) => (center - n) / Math.pow(2, i)
    return intoArray<number, number>(
      comp<AbortableReducer>(
        takeWhile((i: number) => Math.abs(diff(i)) >= 1),
        map((i: number) => n + roundTowardZero(diff(i))),
      ),
      range(0, Number.MAX_VALUE)
    )
  })
}

const choose = (min: number, max: number, center: number = min): ShrinkableGenerator => (rng, _) => {
  const n = rng(min, max)
  return new RoseTree(n, () => shrink.int(n, center))
}

const int: ShrinkableGenerator = (r, size) => choose(-size, size)(r, size)

const fmap = <A, B>(f: (v: A) => B, gen: ShrinkableGenerator): ShrinkableGenerator =>
  (rng, size) => gen(rng, size).map(f)


export const gen = {
  choose,
  int,
  fmap,
}

export const sample = (rng: RNG, gen: ShrinkableGenerator, count = 10): RoseTree[] =>
  intoArray<number, RoseTree>(
    map((n: number) => gen(rng, Math.floor(n / 2) + 1)),
    range(0, count - 1)
  )

const engine = random.engines.mt19937()
engine.seed(9)

const rng: RNG = (min: number, max: number): number => random.integer(min, max)(engine)

// console.log(sample(rng, gen.int, 100))



//////

function shrinkFailing(test: RoseTree, prop: Function) {
  //console.log(test.children())




}

export function forAll(gen: ShrinkableGenerator, prop: Function, count = 100) {
  const samples = sample(rng, gen, count)

  for (let i = 0, v: any; i < samples.length; i++) {
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
