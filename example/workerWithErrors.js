const { Worker } = require('../.')
const worker = new Worker(
  ({ a, b }) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (b > 0.5) return reject('Random error happened')
        resolve(a / b)
      }, 20)
    })
)
module.exports = worker
