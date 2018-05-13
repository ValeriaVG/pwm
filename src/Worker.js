class Worker {
  constructor(task) {
    this.arguments = {}
    this.task = task
    this.busy = false
    process.on('message', async msg => {
      this.arguments = msg
      let result = {}
      try {
        result = await this.task.call(this, this.arguments)
      } catch (error) {
        result = { error }
      }
      process.send(result)
    })
  }
}
module.exports = Worker
