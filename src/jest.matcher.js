const { forAll } = require('./check')

const toMatchProperty = async (gen, prop, opts) => {
  const res = await forAll(gen, prop, opts)
  console.log(res, opts)

  if (res.success) {
    return { pass: true, message: () => 'ok' }
  } else {
    return { pass: false, message: () => 'whoops' }
  }
}

module.exports = toMatchProperty
