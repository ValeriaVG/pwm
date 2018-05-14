const { fork } = require('child_process')
const Queue = require('./src/Queue')
const Worker = require('./src/Worker')

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
      const workerLog = data => {
        console.log(`worker #${i + 1}`, data.toString())
      }
      worker.stdout.on('data', workerLog)
      worker.stderr.on('data', workerLog)
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
    if (this.isFilling || !this.hasMore) return
    if (this.queue.length >= this.workers.length) return
    this.isFilling = true
    try {
      const items = await this.nextBatch()
      if (items.length == 0) {
        this.hasMore = false
        return
      }
      this.queue.add(items)
    } catch (error) {
      this.done({ error: error.toString() })
    }
    this.isFilling = false
  }
  async giveTasksToIdleWorkers() {
    await this.fillQueueIfNeeded()

    this.workers
      .filter(worker => !worker.busy && !worker.isDisconnected)
      .forEach(worker => {
        const data = this.queue.first()
        if (data) {
          worker.busy = true
          worker.input = data
          worker.send(data)
          return
        }
        if (this.hasMore) return
        worker.isDisconnected = true
        worker.disconnect()
      })
  }
}

PWM.Worker = Worker

module.exports = PWM
