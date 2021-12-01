module.exports = {
  root: true,

  env: {
    es6: true,
    node: true
  },

  extends: ["plugin:vue/essential", "@vue/prettier", '@vue/typescript'],

  rules: {
    "no-console": "warn",
    "no-debugger": "error",
    "require-atomic-updates": "off"
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
