const { fork } = require('child_process')

describe('workerWithErrors.js', () => {
  it('performs action with error', done => {
    const worker = fork('example/workerWithErrors.js', [], { silent: true })

    let lastMessage = null
    worker.on('message', msg => {
      lastMessage = msg
    })
    worker.on('error', error => {
      done(error)
    })
    worker.send({ a: 5, b: 6 })
    setTimeout(() => {
      expect(lastMessage.error).toBe('Random error happened')
      done()
    }, 1100)
  })
})
