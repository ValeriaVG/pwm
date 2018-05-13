const Queue = require('../Queue')
const queue = new Queue()

describe('Queue', () => {
  it('can add items to queue', () => {
    expect(queue.length).toBe(0)
    queue.add([1, 2, 3])
    expect(queue.length).toBe(3)
    queue.add([4, 5])
    expect(queue.length).toBe(5)
    queue.add(6)
    expect(queue.length).toBe(6)
  })
  it('can pop an item from queue', () => {
    expect(queue.length).toBe(6)
    const items = queue.remove(4)
    expect(items).toEqual([1, 2, 3, 4])
    expect(queue.length).toBe(2)
  })
})
