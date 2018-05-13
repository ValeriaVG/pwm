[![Maintainability](https://api.codeclimate.com/v1/badges/6698397ad4dc0a99c171/maintainability)](https://codeclimate.com/github/ValeriaVG/pwm/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/6698397ad4dc0a99c171/test_coverage)](https://codeclimate.com/github/ValeriaVG/pwm/test_coverage)

# PWM - Parallel Worker Manager

PWM is a node.js worker manager for distributed batch processing.

## Features

* Maintains constant amount of workers
* Automatically manages batch data collection

## Installation

```bash
yarn add parallel-wm
```

Create worker file:

```js
// worker.js
const Worker = require('parallel-wm/src/Worker')
const worker = new Worker(
  ({ a, b }) =>
    new Promise((resolve, reject) => {
      resolve(a + b)
    })
)
module.exports = worker
```

Create main file:

```js
// index.js
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
  path: 'path/to/worker.js',
  workers: 10,
  nextBatch: () => getBatch(10),
  done: ({ input, output }) => {
    if (input.b > 0.5) expect(output.error).toBe('Random error happened')
    else expect(output).toBe(input.a / input.b)
    outputs.push(output)
    if (outputs.length === 100) done()
  },
})
```

## Roadmap

* [x] Basic features
* [ ] Export Worker from index file
* [ ] Non-batch processing
* [ ] Processing speed stats
