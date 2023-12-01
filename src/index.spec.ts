import { PiniaDebounce } from './index'
import { debounce } from 'ts-debounce'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { type SpyInstance, describe, it, beforeEach, expect, vi } from 'vitest'

const delay = (t: number) => new Promise((r) => setTimeout(r, t))

declare module './index' {
  interface Config {
    Debounce: typeof debounce
  }
}

describe('Pinia Debounce', () => {
  const useOptionsStore = defineStore('one', {
    state: () => ({ count: 0 }),
    actions: {
      one() {
        this.count++
      },
      two() {
        this.count++
      },
    },
    debounce: {
      one: 1,
    },
  })

  const useSetupStore = defineStore(
    'one',
    () => {
      const count = ref(0)
      function one() {
        count.value++
      }
      return { count, one, two: one }
    },
    {
      debounce: {
        one: 1,
      },
    }
  )

  beforeEach(() => {
    const pinia = createPinia()
    // @ts-expect-error: pinia._p is an internal property
    pinia._p.push(PiniaDebounce(debounce))
    setActivePinia(pinia)
  })

  it('debounces options', async () => {
    const store = useOptionsStore()
    expect(store.count).toBe(0)
    store.one()
    store.one()
    store.one()
    expect(store.count).toBe(0)
    await delay(1)
    expect(store.count).toBe(1)
    await delay(1)
    expect(store.count).toBe(1)

    store.two()
    expect(store.count).toBe(2)
  })

  it('debounces setup', async () => {
    const store = useSetupStore()
    expect(store.count).toBe(0)
    store.one()
    store.one()
    store.one()
    expect(store.count).toBe(0)
    await delay(1)
    expect(store.count).toBe(1)
    await delay(1)
    expect(store.count).toBe(1)

    store.two()
    expect(store.count).toBe(2)
  })

  it('ignores no debounce in options', () => {
    const store = defineStore('id', {
      state: () => ({ count: 0 }),
      actions: {
        one() {
          this.count++
        },
      },
    })()

    expect(store.count).toBe(0)
    store.one()
    expect(store.count).toBe(1)
  })

  it('ignores no debounce in setup', () => {
    const store = defineStore('id', () => {
      const count = ref(0)
      function one() {
        count.value++
      }
      return { count, one }
    })()

    expect(store.count).toBe(0)
    store.one()
    expect(store.count).toBe(1)
  })

  describe('debounce function parameters', () => {
    let debounce: SpyInstance<any[], any>

    beforeEach(() => {
      const pinia = createPinia()
      debounce = vi.fn()
      // @ts-expect-error: pinia._p is an internal property
      pinia._p.push(
        // @ts-expect-error: spy instance
        PiniaDebounce(debounce)
      )
      setActivePinia(pinia)
    })

    it('can be passed without options', () => {
      defineStore('id', {
        actions: { a() {} },
        debounce: { a: 0 },
      })()
      expect(debounce).toBeCalledTimes(1)
      expect(debounce).toHaveBeenLastCalledWith(expect.any(Function), 0)
    })

    it('can be passed as array', () => {
      defineStore('id', {
        actions: { a() {} },
        debounce: { a: [0] },
      })()
      expect(debounce).toBeCalledTimes(1)
      expect(debounce).toHaveBeenLastCalledWith(expect.any(Function), 0)
    })

    it('passes extra args', () => {
      defineStore('id', {
        actions: { a() {} },
        debounce: { a: [0, { isImmediate: true }] },
      })()
      expect(debounce).toBeCalledTimes(1)
      expect(debounce).toHaveBeenLastCalledWith(expect.any(Function), 0, {
        isImmediate: true,
      })
    })
  })
})

function tds(fn: () => void) {
  return fn
}

tds(() => {
  // can have other options
  PiniaDebounce((fn: Function, time: number, options?: string) => {})

  // ts tests
  defineStore('id', {
    actions: {},
    debounce: {},
  })
  defineStore('id', {
    debounce: {},
  })

  // this could error but it makes the types too strict
  // defineStore('id', {
  //   debounce: { anyAction: 0}
  // })

  // @ts-expect-error
  defineStore('id', {
    actions: { two() {} },
    debounce: {
      one: 0,
    },
  })

  // it passes options
  defineStore('id', {
    actions: {
      a() {},
      b() {},
    },
    debounce: {
      a: [20],
      b: [
        20,
        {
          isImmediate: true,
        },
      ],
    },
  })
})
