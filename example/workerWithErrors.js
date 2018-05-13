const Worker = require('../src/Worker')
const worker = new Worker(
  ({ a, b }) =>
    new Promise((resolve, reject) => {
      if (b > 0.5) return reject('Random error happened')
      resolve(a / b)
    })
)
module.exports = worker
