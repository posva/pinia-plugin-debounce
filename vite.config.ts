import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src'],
      exclude: ['src/**/*.spec.ts'],
    },
  },
})
