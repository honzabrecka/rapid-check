const { sample, sampleGen, forAll } = require('./check')
const generators = require('./generators')

module.exports = {
  sample,
  sampleGen,
  forAll,
  generators,
  gen: generators
}
