module.exports = {
  root: true,

  env: {
    node: true,
    jquery: true
  },

  extends: ["plugin:vue/essential", "@vue/prettier"],

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },

  parserOptions: {
    parser: '@typescript-eslint/parser'
  },

  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)"],
      env: {
        mocha: true
      }
    }
  ],

  'extends': [
    'plugin:vue/essential',
    '@vue/prettier',
    '@vue/typescript'
  ]
};
