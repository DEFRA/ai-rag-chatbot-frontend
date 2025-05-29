class RedisMock {
  constructor() {
    this.store = new Map()
  }

  get(key) {
    return Promise.resolve(this.store.get(key))
  }

  set(key, value) {
    this.store.set(key, value)
    return Promise.resolve('OK')
  }

  del(key) {
    this.store.delete(key)
    return Promise.resolve(1)
  }

  quit() {
    return Promise.resolve()
  }

  on() {
    // No-op for event listeners in tests
    return this
  }
}

export const Redis = RedisMock
export const Cluster = RedisMock
export default RedisMock
