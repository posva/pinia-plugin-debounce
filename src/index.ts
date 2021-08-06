import { PiniaPluginContext } from 'pinia'

/**
 * Accepted interface for the debounce function passed to `PiniaDebounce`.
 */
export interface Debounce {
  (fn: (...args: any[]) => any, time: number): any
}

/**
 * Adds a `debounce` option to your store to debounce any action. The `debounce`
 * method can be lodash.debounce, ts-debounce, or any other debounce method.
 *
 * @example
 *
 * ```ts
 * import { debounce } from 'ts-debounce'
 *
 * // Pass the plugin to your application's pinia plugin
 * pinia.use(PiniaDebounce(debounce))
 * ```
 *
 * @param debounce - debounce method to be invoked
 */
export const PiniaDebounce =
  (debounce: Debounce) =>
  ({ options, store }: PiniaPluginContext) => {
    const { debounce: debounceOptions } = options
    if (debounceOptions) {
      return Object.keys(debounceOptions).reduce((debouncedActions, action) => {
        debouncedActions[action] = debounce(
          store[action],
          // @ts-ignore: this fails in build...
          debounceOptions[action]!
        )
        return debouncedActions
      }, {} as Record<string, (...args: any[]) => any>)
    }
  }

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    /**
     * Debounce any action by a specified amount of time in ms.
     *
     * @example
     *
     * ```js
     * defineStore('id', {
     *   actions: { someSearch() {}},
     *   debounce: {
     *     // debounce all `someSearch` calls by 300ms
     *     someSearch: 300
     *   }
     * })
     * ```
     */
    debounce?: Partial<Record<keyof StoreActions<Store>, number>>
  }
}
