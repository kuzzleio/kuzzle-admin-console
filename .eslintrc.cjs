const path = require('node:path');

module.exports = {
  root: true,
  extends: ['plugin:vue-kuzzle/default'],
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.json'),
  },
  ignorePatterns: ['dist/*'],
};
