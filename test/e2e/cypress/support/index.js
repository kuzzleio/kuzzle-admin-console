// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
// import Kuzzle from 'kuzzle-sdk'
// Kuzzle.prototype.bluebird = require('bluebird')

// Alternatively you can use CommonJS syntax:
// require('./commands')

// const instantiateKuzzle = async host => {
//   return new Promise((resolve, reject) => {
//     // eslint-disable-next-line
//     new Kuzzle(host, (err, kuzzle) => {
//       if (err) {
//         reject(err)
//         return
//       }
//       resolve(kuzzle)
//     })
//   })
// }

// beforeEach(() => {
//   let k
//   return instantiateKuzzle('localhost')
//     .then(kuzzle => {
//       k = kuzzle
//       return kuzzle.listIndexesPromise()
//     })
//     .then(indexes => {
//       const promises = indexes.map(index => {
//         return k.queryPromise(
//           { index, controller: 'index', action: 'delete' },
//           {}
//         )
//       })
//       return Promise.all(promises)
//     })
// })

require('cypress-plugin-retries')
