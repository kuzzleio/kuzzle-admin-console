const path = require('node:path');

module.exports = {
  root: true,
  extends: ['plugin:vue-kuzzle/default'],
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.json'),
  },
  ignorePatterns: ['dist/*'],
  rules: {
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/require-array-sort-compare': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-dynamic-delete': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/block-lang': 'off',
    'vue/no-mutating-props': 'off',
    'array-callback-return': 'off',
    'vue/require-default-prop': 'off',
    'vue/order-in-components': 'off',
    'vue/no-useless-template-attributes': 'off',
    'vue/no-reserved-component-names': 'off',
    'vue/require-prop-types': 'off',
    'vue/no-lone-template': 'off',
    // Chaque lot de phase 3 éteint un drapeau de compat ; la règle
    // correspondante interdit de réintroduire l'usage Vue 2. Voir G-050 :
    // un `async destroyed()` oublié devient du code mort silencieux dès que
    // `OPTIONS_DESTROYED` est éteint, et aucune spec ne le voit.
    'vue/no-deprecated-destroyed-lifecycle': 'error',
    // Symétrique, pour `COMPILER_V_BIND_SYNC` : `vue/no-deprecated-v-bind-sync`
    // interdit de réintroduire `:prop.sync`, et `vue/no-v-model-argument` —
    // règle Vue 2 héritée de la config partagée — doit s'éteindre, puisque
    // c'est exactement `v-model:prop` qu'elle proscrit.
    'vue/no-deprecated-v-bind-sync': 'error',
    'vue/no-v-model-argument': 'off',
    'default-case-last': 'warn',
    'import/order': 'warn'
  },
};
