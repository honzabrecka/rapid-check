const { choose } = require('../generators')
const toMatchProperty = require('../jest.matcher')

expect.extend({ toMatchProperty })

describe('jest custom matcher', () => {
  it('ok', () => {
    const s = new Set([1, 2, 3])
    const prop = (v) => s.has(v)
    expect(choose(1, 3)).toMatchProperty(prop, { seed: 10 })
  })
})
