module.exports = {
  root: true,

  env: {
    es6: true,
    node: true
  },

  extends: ["plugin:vue/essential", "@vue/prettier", '@vue/typescript'],

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
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
