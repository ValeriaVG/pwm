const PWM = require('../index')

let inputs = []
let outputs = []
let _done = 0
let pwm = null

const getBatch = async n => {
  if (_done >= 100) return []
  let a = []
  for (let i = 0; i < n; i++) {
    a.push({ a: Math.random(), b: Math.random() })
  }
  _done += n
  inputs = inputs.concat(a)
  return a
}

const doneCheck = (check, done) => ({ input, output }) => {
  check({ input, output })
  outputs.push(output)
  if (outputs.length == 100) {
    expect(pwm.queue.length).toBe(0)
    setTimeout(() => {
      expect(pwm.workers.filter(w => !w.isDisconnected).length).toBe(0)
      done()
    }, 100)
  }
}

describe('PWM', () => {
  it('creates and starts manager', done => {
    _done = 0
    inputs = []
    outputs = []

    pwm = new PWM({
      path: 'example/workerWithErrors.js',
      workers: 10,
      nextBatch: () => getBatch(10),
      done: doneCheck(({ input, output }) => {
        if (input.b > 0.5) expect(output.error).toBe('Random error happened')
        else expect(output.result).toBe(input.a / input.b)
        expect(output.stats.ms).toBeGreaterThanOrEqual(19)
      }, done),
    })
  })
  it('throws errors if not all properties filled', () => {
    expect(() => {
      pwm = new PWM()
    }).toThrowErrorMatchingSnapshot()
  })
  it('works okay even if batch is less than amount of workers', done => {
    _done = 0
    inputs = []
    outputs = []

    pwm = new PWM({
      path: 'example/worker.js',
      workers: 10,
      nextBatch: () => getBatch(1),
      done: doneCheck(({ input, output }) => {
        expect(output.result).toBe(input.a + input.b)
        expect(output.stats.ms).toBeGreaterThanOrEqual(0)
      }, done),
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

  it('works with queue', done => {
    const pwm = new PWM({
      path: 'example/worker.js',
      workers: 5,
      queue: [{ a: 1, b: 2 }],
      done: ({ input, output }) => {
        expect(input).toEqual({ a: 1, b: 2 })
        expect(output.result).toEqual(3)
        done()
      },
    })
  })
})
