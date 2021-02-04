module.exports = {
  extends: ["@vue/prettier"],
  plugins: ["cypress"],
  env: {
    mocha: true,
    "cypress/globals": true
  },
  rules: {
    strict: "off"
  }
};
