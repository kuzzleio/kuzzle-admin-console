// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const path = require('path')
const execa = require('execa')

module.exports = on => {
  on('task', {
    doco({ version, docoArgs, port, stackPrefix }) {
      const docoFile = path.join(
        process.cwd(),
        'test',
        'e2e',
        `stack-v${version}.yml`
      )
      if (!port) {
        port = '7512'
      }
      if (!stackPrefix) {
        stackPrefix = 'stack'
      }
      console.log(
        `cy.task('doco') -- $ KUZZLE_PORT=${port} docker-compose -f ${docoFile} -p stack-${version} ${docoArgs.join(
          ' '
        )}`
      )

      execa(
        'docker-compose',
        ['-f', docoFile, '-p', `${stackPrefix}-${version}`].concat(docoArgs),
        {
          env: {
            KUZZLE_PORT: port,
            ES_JAVA_OPTS: '-Xms512m -Xmx512m'
          }
        }
      )
      return true
    }
  })
}
