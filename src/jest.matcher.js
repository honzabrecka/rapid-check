const { forAll } = require('./check')

const complement = f => async v => !(await f(v))

module.exports = async function toMatchProperty(gen, prop, opts) {
  const result = await forAll(gen, this.isNot ? complement(prop) : prop, opts)
  const message = () => {
    if (result.success) return 'ok'

    const { seed, shrink, fail } = result
    return (
      `\n\n` +
      `  fail: ${this.utils.printReceived(fail[0])}\n` +
      `  min: ${this.utils.printReceived(shrink.min)}\n` +
      `  (shrinking details) attempts: ${shrink.attempts}; shrinks: ${shrink.shrinks}\n` +
      `  seed: ${seed}\n`
    )
  }

  return {
    pass: this.isNot ? !result.success : result.success,
    message,
  }
}
