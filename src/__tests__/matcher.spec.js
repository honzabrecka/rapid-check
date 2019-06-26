const { choose } = require('../generators')
const toMatchProperty = require('../jest.matcher')

expect.extend({ toMatchProperty })

describe('jest custom matcher', () => {
  it('ok', async () => {
    const s = new Set([1, 2, 3])
    const prop = v => s.has(v)
    await expect(choose(1, 3)).toMatchProperty(prop, { seed: 10 })
  })

  it.skip('failing', async () => {
    const s = new Set([1, 2, 3])
    const prop = v => s.has(v)
    await expect(choose(5, 6)).toMatchProperty(prop, { seed: 11 })
  })

  it('ok not', async () => {
    const s = new Set([1, 2, 3])
    const prop = v => s.has(v)
    await expect(choose(5, 6)).not.toMatchProperty(prop, { seed: 12 })
  })

  it.skip('failing not', async () => {
    const s = new Set([1, 2, 3])
    const prop = v => s.has(v)
    await expect(choose(1, 3)).not.toMatchProperty(prop, { seed: 13 })
  })
})
