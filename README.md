# rapid-check [![CircleCI](https://circleci.com/gh/honzabrecka/rapid-check/tree/master.svg?style=svg&circle-token=14045240bf5689c38b0a3dcbf478a2f012ab6574)](https://circleci.com/gh/honzabrecka/rapid-check/tree/master)

Yet another implementation of property based testing framework with support for async properties.

## Prerequisites

It's based on async generators, therefore it requires nodejs >=10.

## Installation

```console
npm install rapid-check
```

## Usage

Works with any testing framework, here's an example using [jest >=23](https://facebook.github.io/jest/):

```js
const { generators } = require('rapid-check')
const toMatchProperty = require('rapid-check/src/jest.matcher')

expect.extend({ toMatchProperty })

test('Set.has function', async () => {
  const prop = (v) => new Set([1, 2, 3]).has(v)
  await expect(generators.choose(1, 3)).toMatchProperty(prop)
})
```

## Generators

### constantly(any)

```js
sample(constantly(4))
// [4, 4, 4, 4, ...]
```

### choose(min, max)

```js
sample(choose(1, 3))
// [2, 1, 3, 1, ...]
```

### bool

```js
sample(bool)
// [true, true, false, true, ...]
```

### int

```js
sample(int)
// [0, 1, -2, 3, ...]
```

### uint

```js
sample(uint)
// [0, 1, 0, 3, ...]
```

### tuple(...gens)

```js
sample(tuple(uint, uint))
// [[0, 0], [1, 0], [1, 2], [0, 1], ...]
```

### array(gen, min, max)

```js
sample(array(uint, 1, 3))
// [[0], [1], [2, 0], [1, 1], [0], [0, 3, 3], ...]
```

### oneOf(...gens)

```js
sample(oneOf(bool, uint))
// [true, 1, 2, false, ...]
```

### fmap(f, gen)

Where f: `a -> b`

```js
const negate = (n) => -n
sample(fmap(negate, uint))
// [0, -1, -1, -3, ...]
```

### mbind(f, gen)

Where f: `a -> Gen b`

```js
const f = (n) => ap(tuple, repeat(bool, n))
sample(mbind(f, uint))
// [[], [true], [false, false], [false], ... [true, false, false, true, false], [false]]
```
