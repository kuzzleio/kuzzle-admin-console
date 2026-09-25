import js from '@eslint/js';
import cypress from 'eslint-plugin-cypress';
import vueKuzzle from 'eslint-plugin-vue-kuzzle';
import globals from 'globals';

const APP_FILES = ['src/**/*.{ts,tsx,vue}'];
const SPEC_FILES = ['test/e2e/cypress/**/*.js'];

export default [
  { ignores: ['dist/**', 'build/**', 'config/**', 'node_modules/**'] },

  // Le socle d'ESLint (`no-dupe-keys`, `no-unreachable`, `valid-typeof`…) :
  // l'ancienne config l'avait via `standard`, `eslint-plugin-vue-kuzzle` 2.0 ne
  // l'inclut pas. Voir ADR-0040.
  { ...js.configs.recommended, files: APP_FILES },

  // Code applicatif : le standard Kuzzle, restreint à `src/`. Sans `files`,
  // `configs.base` s'appliquerait aussi aux specs, dont le style n'est pas
  // imposé (voir plus bas).
  ...vueKuzzle.configs.default.map((config) => ({
    ...config,
    files: config.files ?? APP_FILES,
  })),
  {
    files: APP_FILES,
    rules: {
      // Reportés de l'ancienne config, qui les éteignait déjà.
      // `ban-types` a été éclatée par typescript-eslint 8 en
      // `no-wrapper-object-types` et `no-empty-object-type`.
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/block-lang': 'off',
      'vue/no-mutating-props': 'off',
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
      // Idem pour `COMPONENT_V_MODEL` : l'option `model` de Vue 2 ne doit pas
      // revenir. La règle ne couvre pas les `v-model` nus posés sur un composant
      // tiers Vue 2 — c'est un angle mort, documenté en G-053.
      'vue/no-deprecated-model-definition': 'error',
      'default-case-last': 'warn',
      // Était `import/order: warn` ; le niveau seul est surchargé, les options
      // de la config Kuzzle sont conservées.
      'import-x/order': 'warn',
      // Nouvelle avec les règles Vue 3 : pur style de template (`@someEvent`
      // contre `@some-event`), sans rien attraper. `vue/require-explicit-emits`,
      // elle, reste en avertissement : c'est la dette qu'ADR-0029 a commencé à
      // solder.
      'vue/v-on-event-hyphenation': 'off',
      // Perdue avec `standard`, dont on garde la forme : `== null` reste permis.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // Specs Cypress : pas de tsconfig, pas de style imposé. On ne garde que les
  // règles qui protègent le filet de sécurité lui-même.
  //
  // Motif : les 17 specs sont le seul filet du projet (il n'y a pas de tests
  // unitaires). Un `.only` qui s'y glisse désactive silencieusement tous les
  // autres tests du fichier, sans que Cypress ni la CI ne signalent quoi que ce
  // soit. Deux d'entre eux ont ainsi masqué 14 tests, l'un pendant plus de trois
  // ans. Cf. docs/MIGRATION.md et l'issue #1020.
  {
    files: SPEC_FILES,
    plugins: { cypress },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.es2021,
        ...cypress.configs.globals.languageOptions.globals,
      },
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[property.name='only'][object.name=/^(describe|context|it|test|suite|specify)$/]",
          message:
            '`.only` désactive silencieusement tous les autres tests du fichier et laisse la CI au vert.',
        },
        {
          selector: 'CallExpression[callee.name=/^(fdescribe|fit)$/]',
          message:
            '`fdescribe`/`fit` désactivent silencieusement tous les autres tests du fichier.',
        },
        // Cf. ADR-0006. On attend un état observable, jamais une durée.
        //
        // Le sélecteur ne vise que le littéral numérique : `cy.wait('@alias')`
        // reste autorisé, et une durée passée par identifiant l'est aussi — c'est
        // la forme réservée aux rares délais réellement subis, nommés et
        // commentés dans `support/commands.js` (cf. `waitOverlay`,
        // `shouldStayOn`). Un nombre nu dans une spec, lui, ne dit rien de ce
        // qu'on attend.
        {
          selector:
            "CallExpression[callee.object.name='cy'][callee.property.name='wait'] > Literal[raw=/^[.0-9]/]",
          message:
            "`cy.wait(<durée>)` n'exprime pas ce qu'on attend : trop courte elle casse sous charge, trop longue elle ralentit la suite sans rien garantir. Attendre un état observable — `.should()`, `cy.aceReady()`, `cy.expectBackend()`, `cy.shouldStayOn()` (cf. ADR-0006). `cy.wait('@alias')` reste autorisé.",
        },
      ],
    },
  },
];
