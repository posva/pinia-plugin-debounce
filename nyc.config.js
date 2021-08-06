module.exports = {
  extends: '@istanbuljs/nyc-config-typescript',
  reporter: ['text', 'lcov'],
  all: true,
  include: ['src'],
  exclude: ['src/**/*.spec.ts'],
}
