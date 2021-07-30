module.exports = {
  root: true,

  env: {
    es6: true,
    node: true
  },

  extends: ["plugin:vue/essential", "@vue/prettier", '@vue/typescript'],

  rules: {
    "no-console": "error",
    "no-debugger": "error",
    "require-atomic-updates": "off",
    "semi": ["error", "always"],
    "semi-spacing": ["error", {"before": true, "after": false}],
    "semi-style": ["error", "first"],
    "operator-linebreak": ["error", "after"],
    "sort-imports": "error",
    "newline-before-return": "error",
    "func-call-spacing": ["error", "always", { "allowNewlines": true }]
  },

  parserOptions: {
    parser: '@typescript-eslint/parser'
  },

  overrides: [
    {
      files: ["test/**/*.js"],
      env: {
        mocha: true
      }
    }
  ]
};
