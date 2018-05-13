class Queue {
  constructor() {
    this.items = []
  }
  get length() {
    return this.items.length
  }
  add(items) {
    if (items.length) {
      this.items = this.items.concat(items)
      return
    }
    this.items.push(items)
  }
  remove(count) {
    let poppedItems = []
    for (let i = 0; i < count; i++) {
      poppedItems.push(this.items.shift())
    }
    return poppedItems
  }
  first() {
    return this.items.shift()
  }
}
module.exports = Queue
