import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    typecheck: {
      enabled: true,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcovonly', 'html'],
      include: ['src/**'],
      exclude: ['src/**/*.spec.ts'],
    },
  },
})
