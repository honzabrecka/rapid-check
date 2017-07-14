const random = require('random-js')

module.exports = (seed = 9) => {
  const engine = random.engines.mt19937().seed(seed)
  return (min, max) => random.integer(min, max)(engine)
}
