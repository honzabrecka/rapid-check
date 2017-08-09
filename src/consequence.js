function generate(seq, bef = []) {
  return seq.reduce(([r, i, p], v) => {
    v = Array.isArray(v) ? generate(v) : v
    return [
      r.concat([p.concat([v])]),
      i + 1,
      p.concat([v])
    ]
  }, [[[]], 0, []])[0]
}

module.exports = {
  generate,
}
