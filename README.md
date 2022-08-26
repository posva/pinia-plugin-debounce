<h1>
  <img height="64" src="https://pinia.esm.dev/logo.svg" alt="Pinia logo">
  Pinia Debounce
</h1>

<a href="https://npmjs.com/package/@pinia/plugin-debounce">
  <img src="https://badgen.net/npm/v/@pinia/plugin-debounce/latest" alt="npm package">
</a>
<a href="https://github.com/posva/pinia-plugin-debounce/actions/workflows/test.yml">
  <img src="https://github.com/posva/pinia-plugin-debounce/workflows/test/badge.svg" alt="build status">
</a>
<a href="https://codecov.io/gh/posva/pinia-plugin-debounce">
  <img src="https://codecov.io/gh/posva/pinia-plugin-debounce/branch/main/graph/badge.svg?token=9WqnRrLf1Q"/>
</a>

Debounce any action in your pinia 🍍 store!

This is also a very good example of **how to create a pinia plugin and how to type it**.

## Installation

```sh
npm install @pinia/plugin-debounce
```

You also need to use a `debounce` function like [lodash.debounce](https://lodash.com/docs/4.17.15#debounce) or [ts-debounce](https://github.com/chodorowicz/ts-debounce)

## Usage

```js
import { debounce } from 'ts-debounce'
import { PiniaDebounce } from '@pinia/plugin-debounce'

// Pass the plugin to your application's pinia plugin
pinia.use(PiniaDebounce(debounce))
```

You can then use a `debounce` option in your stores:

```js
defineStore('id', {
  actions: {
    someSearch() {
      // ...
    },
    other() {
      // ...
    },
  },
  debounce: {
    // debounce all `someSearch` calls by 300ms
    someSearch: 300,
    // you can pass an array of arguments if your debounce implementation accepts extra arguments
    someSearch: [
      300,
      {
        // options passed to debounce
        isImmediate: true,
      },
    ],
  },
})
```

For setup stores, options are in a second arugment:

```js
defineStore(
  'id',
  () => {
    // ...the store

    return { someSearch }
  },
  {
    debounce: {
      // debounce all `someSearch` calls by 300ms
      someSearch: 300,
    },
  }
)
```

### Extended TypeScript support

By default, extra arguments passed to your `debounce` implementation are not typed. This can be changed by extending the `Config` interface in any of your ts files:

```ts
import { debounce } from 'ts-debounce'

declare module '@pinia/plugin-debounce' {
  export interface Config {
    Debounce: typeof debounce
  }
}
```

## License

[MIT](http://opensource.org/licenses/MIT)
