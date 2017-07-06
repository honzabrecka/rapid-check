import * as random from 'random-js'

export class RoseTree {

  constructor(public root: number, public children: Function) {}

}

export function* range(from: number, to: number) {
  while (from++ < to) yield from
}


export interface R {
  integer: (min: number, max: number) => number
}

export interface G {
  (r: R, size: number): RoseTree
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

const choose = (min: number, max: number, center: number = min): G => (r, _) => {
  const n = r.integer(min, max)
  return new RoseTree(n, () => shrink.int(n, center))
}

const int: G = (r, size) => choose(-size, size)(r, size)

export const gen = {
  choose,
  int
}

export function sample(r: R, gen: G, count = 10) {
  const results = new Array(count)

  for (let i = 0; i < count; i++) {
    results[i] = gen(r, Math.floor(i / 2) + 1)
  }

  return results
}

const engine = random.engines.mt19937()
engine.seed(9)

const r = {
  integer: (min: number, max: number): number => random.integer(min, max)(engine)
}

//console.log(sample(r, gen.int, 100))

//////

function shrinkFailing(test: RoseTree, prop: Function) {
  console.log(test.children())




}

function forAll(gen: G, prop: Function) {
  const samples = sample(r, gen, 100)

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
