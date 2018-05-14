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
const { Worker } = require('parallel-wm')
const worker = new Worker(
  ({ a, b }) =>
    new Promise((resolve, reject) => {
      resolve(a + b)
    })
)
module.exports = worker
```

### Fetching batches on demand:

Create main file:

```js
// index.js
const PWM = require('parallel-wm')

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
    if (output.error) {
      return console.error(error)
    }
    console.log(output.result, output.stats)
  },
})
```

### Process array:

Create main file:

```js
// index.js
const PWM = require('parallel-wm')

const pwm = new PWM({
  path: 'path/to/worker.js',
  workers: 10,
  queue: [{ a: 1, b: 2 }, { a: 0, b: 1 }],
  done: ({ input, output }) => {
    if (output.error) {
      return console.error(error)
    }
    console.log(output.result, output.stats)
  },
})
```

## Output Format

* result: response from the Worker task if any
* error: error if any
* stats:
  * started: timestamp in JS date format
  * finished: timestamp in JS date format
  * ms: how much operation took in ms

## Roadmap

* [x] Basic features
* [x] Processing speed stats
* [x] Export Worker from index file
* [x] Static array processing
