const { fork } = require('child_process')
const Queue = require('./src/Queue')

class PWM {
  constructor(payload = {}) {
    if (!payload.workers) payload.workers = 10

    const { path, workers, nextBatch, done } = payload

    if (!path || !nextBatch || !done) {
      throw new Error('You must provide path, nextBatch and done')
    }

    this.workers = []
    this.hasMore = true
    this.queue = new Queue()
    this.nextBatch = nextBatch
    this.done = done
    this.isFilling = false
    for (let i = 0; i < workers; i++) {
      const worker = fork(path, [], { stdio: 'pipe' })
      worker.stdout.on('data', data => {
        console.log(`worker #${i + 1}`, data.toString())
      })
      worker.stderr.on('data', data => {
        console.error(`worker #${i + 1}`, data.toString())
      })
      worker.on('message', message => {
        this.next({ message, worker })
      })

      this.workers.push(worker)
    }

    this.giveTasksToIdleWorkers()
  }

  async next({ message, worker }) {
    worker.busy = false
    this.done({ input: worker.input, output: message })
    this.giveTasksToIdleWorkers()
  }

  async fillQueueIfNeeded() {
    if (this.isFilling) return
    if (this.queue.length < this.workers.length && this.hasMore) {
      this.isFilling = true
      const items = await this.nextBatch().catch(console.error)
      this.isFilling = false
      if (!items || items.length == 0) {
        this.hasMore = false
        return
      }
      this.queue.add(items)
    }
  }
  async giveTasksToIdleWorkers() {
    await this.fillQueueIfNeeded()

    for (let i = 0; i < this.workers.length; i++) {
      const worker = this.workers[i]
      if (worker.busy) continue
      const data = this.queue.first()

      if (!data) {
        if (!worker.isDisconnected) {
          worker.isDisconnected = true
          worker.disconnect()
        }
        continue
      }
      worker.busy = true
      worker.input = data
      worker.send(data)
    }
  }
}
module.exports = PWM
