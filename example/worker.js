const Worker = require('../src/Worker')
const worker = new Worker(
  ({ a, b }) =>
    new Promise((resolve, reject) => {
      resolve(a + b)
    })
)
module.exports = worker
