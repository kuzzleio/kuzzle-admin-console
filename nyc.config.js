module.exports = {
  'check-coverage': true,
  'per-file': true,
  'skip-full': true,
  all: true,
  include: ['src/services/*.js', 'src/vuex/**/*.js'],
  exclude: ['src/*.js', '**/index.js'],
  reporter: ['lcov', 'text', 'text-summary'],
  extension: ['.js']
}
