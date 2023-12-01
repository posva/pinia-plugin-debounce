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
      return Object.keys(debounceOptions).reduce(
        (debouncedActions, action) => {
          const args = [store[action]].concat(debounceOptions[action])
          debouncedActions[action] = debounce.apply(
            null,
            // @ts-expect-error: wrong array type
            args
          )
          return debouncedActions
        },
        {} as Record<string, (...args: any[]) => any>
      )
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
    debounce?: Partial<
      Record<
        keyof StoreActions<Store>,
        | number
        | (Config extends Record<'Debounce', infer DebounceFn>
            ? _ParamsAfterNumber<DebounceFn>
            : [number, ...any[]])
      >
    >
  }
}

export type _ParamsAfterNumber<F> = F extends (
  fn: (...args: any[]) => any,
  time: number,
  ...rest: infer Rest
) => any
  ? [number, ...Rest]
  : [number, ...any[]]

/**
 * Allows you to provide a type for your debounce function so you can pass extra arguments to it in a type safe way.
 *
 * @example
 *
 * ```ts
 * // Add this to your main.ts or any other ts file
 * import { debounce } from 'ts-debounce'
 * declare module '@pinia/plugin-debounce' {
 *   export interface Config {
 *     Debounce: typeof debounce
 *   }
 * }
 * ```
 */
export interface Config {
  // Debounce: any
}
