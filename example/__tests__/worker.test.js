const { fork } = require('child_process')

describe('worker.js', () => {
  it('performs an action when requested by main process', done => {
    const worker = fork('example/worker.js', [], { silent: true })

    let lastMessage = null
    worker.on('message', msg => {
      lastMessage = msg
    })
    worker.on('error', error => {
      done(error)
    })
    worker.send({ a: 5, b: 6 })
    setTimeout(() => {
      expect(lastMessage.result).toBe(11)
      done()
    }, 1100)
  })
})
