const PWM = require('../index')
describe('PWM', () => {
  it('creates and starts manager', done => {
    const n = 10
    let _done = 0
    let inputs = []
    let outputs = []
    const getBatch = async () => {
      if (_done >= 100) return []
      let a = []
      for (let i = 0; i < n; i++) {
        a.push({ a: Math.random(), b: Math.random() })
      }
      _done += n
      inputs = inputs.concat(a)
      return a
    }

    const pwm = new PWM({
      path: 'example/workerWithErrors.js',
      workers: 10,
      nextBatch: () => getBatch(10),
      done: ({ input, output }) => {
        if (input.b > 0.5) expect(output.error).toBe('Random error happened')
        else expect(output).toBe(input.a / input.b)
        outputs.push(output)
        if (outputs.length === inputs.length) done()
      },
    })
  })
  it('throws errors if not all properties filled', () => {
    expect(() => {
      const pwm = new PWM()
    }).toThrowErrorMatchingSnapshot()
  })
})
