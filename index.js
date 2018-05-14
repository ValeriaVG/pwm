const { fork } = require('child_process')
const Queue = require('./src/Queue')
const Worker = require('./src/Worker')

class PWM {
  constructor(payload = {}) {
    if (!payload.workers) payload.workers = 10
    const { path, workers, nextBatch, done, queue } = payload
    if (!path) {
      throw new Error('You must provide path to Worker')
    }
    if (!nextBatch && !queue) {
      throw new Error('You must provide or nextBatch function or queue array')
    }
    this.workers = []
    this.hasMore = true
    this.queue = new Queue()
    this.nextBatch = nextBatch
    this.done = done
    this.isFilling = false
    if (!nextBatch) this.hasMore = false
    if (queue && queue.length) this.queue.add(queue)
    this.forkWorkers(path, workers)
    this.giveTasksToIdleWorkers()
  }

  forkWorkers(path, n) {
    for (let i = 0; i < n; i++) {
      const worker = fork(path, [], { stdio: 'pipe' })
      const workerLog = data => console.log(`worker #${i + 1}`, data.toString())
      worker.stdout.on('data', workerLog)
      worker.stderr.on('data', workerLog)
      worker.on('message', message => this.next({ message, worker }))
      this.workers.push(worker)
    }
  }
  async next({ message, worker }) {
    worker.busy = false
    if (this.done) this.done({ input: worker.input, output: message })
    this.giveTasksToIdleWorkers()
  }

  async fillQueueIfNeeded() {
    if (!this.nextBatch) return
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
