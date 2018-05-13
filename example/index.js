const PWM = require('../index')
const n = 10
let done = 0
let inputs = []
let outputs = []
const getBatch = async () => {
  if (done >= 100) return []
  let a = []
  for (let i = 0; i < n; i++) {
    a.push({ a: Math.random(), b: Math.random() })
  }
  done += n
  inputs = inputs.concat(a)
  return a
}

const pwm = new PWM({
  path: 'example/workerWithErrors.js',
  workers: 10,
  nextBatch: () => getBatch(10),
  done: ({ input, output }) => {
    outputs.push(output)
    console.log(`done ${outputs.length}/${inputs.length}`, { input, output })
  },
})
