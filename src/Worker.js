class Worker {
  constructor(task) {
    this.arguments = {}
    this.task = task
    this.started = new Date()
    process.on('message', async msg => {
      const result = await this.trigger.call(this, msg)
      process.send(result)
    })
  }

  async trigger(msg) {
    this.arguments = msg
    this.started = new Date()
    let result = null
    let error = null
    try {
      result = await this.task.call(this, this.arguments)
    } catch (err) {
      error = err.toString()
    }
    const finished = new Date()
    const stats = {
      started: this.started,
      finished,
      ms: finished.getTime() - this.started.getTime(),
    }
    return { result, error, stats }
  }
}
module.exports = Worker
