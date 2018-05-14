const Worker = require('../Worker')

describe('Worker', () => {
  it('can perform task', async () => {
    const worker = new Worker(({ a, b }) => {
      return a + b
    })
    const { result, error } = await worker.trigger({ a: 1, b: 2 })
    expect(result).toBe(3)
    expect(error).toBeNull()
  })
  it('can catch an error in task', async () => {
    const worker = new Worker(() => {
      throw new Error('Test error')
    })
    const { result, error } = await worker.trigger()
    expect(result).toBeNull()
    expect(error).toBe('Error: Test error')
  })
})
