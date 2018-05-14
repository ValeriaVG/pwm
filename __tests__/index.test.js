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
        else expect(output.result).toBe(input.a / input.b)
        expect(output.stats.ms).toBeGreaterThanOrEqual(19)
        outputs.push(output)
        if (outputs.length == 100) {
          expect(pwm.queue.length).toBe(0)
          setTimeout(() => {
            expect(pwm.workers.filter(w => !w.isDisconnected).length).toBe(0)
            done()
          }, 100)
        }
      },
    })
  })
  it('throws errors if not all properties filled', () => {
    expect(() => {
      const pwm = new PWM()
    }).toThrowErrorMatchingSnapshot()
  })
  it('works okay even if batch is less than amount of workers', done => {
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
      path: 'example/worker.js',
      workers: 10,
      nextBatch: () => getBatch(1),
      done: ({ input, output }) => {
        expect(output.result).toBe(input.a + input.b)
        expect(output.stats.ms).toBeGreaterThanOrEqual(0)
        outputs.push(output)
        if (outputs.length == 100) {
          expect(pwm.queue.length).toBe(0)
          setTimeout(() => {
            expect(pwm.workers.filter(w => !w.isDisconnected).length).toBe(0)
            done()
          }, 100)
        }
      },
    })
  })

  it('works okay even if batch is less than amount of workers', done => {
    const pwm = new PWM({
      path: 'example/worker.js',
      workers: 1,
      nextBatch: async () => {
        throw new Error('Batch error')
      },
      done: ({ error }) => {
        expect(error).toBe('Error: Batch error')
        done()
      },
    })
  })
})
