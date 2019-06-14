module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: [
    'standard',
    'plugin:vue/recommended'
  ],
  // required to lint *.vue files
  plugins: ['html', 'cypress', 'mocha'],
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow functions declarations without space befor the parens
    'space-before-function-paren': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-trailing-spaces': 0,
    'vue/require-prop-types': 0,
    'vue/require-default-prop': 0,
    'vue/no-v-html': 0,
    'vue/no-side-effects-in-computed-properties': 0
  },
  env: {
    'cypress/globals': true
  },
  globals: {
    window: false,
    localStorage: false,
    $: false,
    JSON: false
  }
}
