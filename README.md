# rapid [![CircleCI](https://circleci.com/gh/honzabrecka/rapid/tree/master.svg?style=svg&circle-token=14045240bf5689c38b0a3dcbf478a2f012ab6574)](https://circleci.com/gh/honzabrecka/rapid/tree/master)

Yet another implementation of property based testing framework with support for async properties.

# Usage

Works with any testing framework, here's example using [jest](https://facebook.github.io/jest/):

```js
it('tests Set.has function', () => {
  const s = new Set([1, 2, 3])
  const prop = (v) => s.has(v)
  const [result, _] = forAll(choose(1, 3), prop)
  expect(result).toBe(true)
})

it('tests async Set.has function', async () => {
  const s = new Set([1, 2, 3])
  const prop = (v) => Promise.resolve(s.has(v))
  const [result, _] = await asyncForAll(choose(1, 3), prop)
  expect(result).toBe(true)
})
```

# Generators

## constantly(any)

```js
sample(constantly(4))
// [4, 4, 4, 4, ...]
```

## choose(min, max)

```js
sample(choose(1, 3))
// [2, 1, 3, 1, ...]
```

## bool

```js
sample(bool)
// [true, true, false, true, ...]
```

## int

```js
sample(int)
// [0, 1, -2, 3, ...]
```

## uint

```js
sample(uint)
// [0, 1, 0, 3, ...]
```

## tuple(...gens)

```js
sample(tuple(uint, uint))
// [[0, 0], [1, 0], [1, 2], [0, 1], ...]
```

## oneOf(...gens)

```js
sample(oneOf(bool, uint))
// [true, 1, 2, false, ...]
```

## fmap(f, gen)

Where f: `a -> b`

```js
const negate = (n) => -n
sample(fmap(negate, uint))
// [0, -1, -1, -3, ...]
```

## mbind(f, gen)

Where f: `a -> Gen b`

```js
const f = (n) => ap(tuple, repeat(bool, n))
sample(mbind(f, uint))
// [[], [true], [false, false], [false], ... [true, false, false, true, false], [false]]
```
