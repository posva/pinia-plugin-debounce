import expect from 'expect'
import { PiniaDebounce } from './index'
import { debounce } from 'ts-debounce'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { ref } from 'vue'

const delay = (t: number) => new Promise((r) => setTimeout(r, t))

describe('Pinia Debounce', () => {
  const useOptionsStore = defineStore('one', {
    state: () => ({ count: 0 }),
    actions: {
      one() {
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
      return { count, one }
    },
    {
      debounce: {
        one: 1
      },
    }
  )

  beforeEach(() => {
    const pinia = createPinia()
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
  })

  // ts tests
  defineStore('id', {
    actions: {},
    debounce: {}
  })
  defineStore('id', {
    debounce: {}
  })


  // this could error but it makes the types too strict
  // defineStore('id', {
  //   debounce: { anyAction: 0}
  // })

  // @ts-expect-error
  defineStore('id', {
    actions: { two() { }},
    debounce: {
      one: 0
    }
  })
})
