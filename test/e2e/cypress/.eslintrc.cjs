// Configuration isolée pour les specs Cypress (`root: true`).
//
// Les specs ne sont pas couvertes par le tsconfig applicatif, et le style du
// code applicatif ne leur est pas imposé : on ne garde ici que les règles qui
// protègent le filet de sécurité lui-même.
//
// Motif : les 17 specs sont le seul filet du projet (il n'y a pas de tests
// unitaires). Un `.only` qui s'y glisse désactive silencieusement tous les
// autres tests du fichier, sans que Cypress ni la CI ne signalent quoi que ce
// soit. Deux d'entre eux ont ainsi masqué 14 tests, l'un pendant plus de trois
// ans. Cf. docs/MIGRATION.md et l'issue #1020.

module.exports = {
  root: true,
  env: {
    es2022: true,
    'cypress/globals': true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['cypress'],
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
    ],
  },
};
