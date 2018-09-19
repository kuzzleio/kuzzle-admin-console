const { setWorldConstructor, setDefaultTimeout } = require('cucumber')
// const Kuzzle = require('kuzzle-sdk')

const baseOpts = {
  args: ['--no-sandbox'],
  dumpio: process.env.show_console_output !== undefined,
  slowMo: 120
}
const localDevOpts = {
  headless: false
}

function CustomWorld() {
  this.isLocal = process.env.e2eLocal !== undefined
  this.kuzzleHostname = this.isLocal ? 'localhost' : 'kuzzle'

  this.puppeteerOpts = this.isLocal
    ? Object.assign(baseOpts, localDevOpts)
    : baseOpts

  this.url = process.env.e2eLocal
    ? 'http://localhost:3000'
    : 'http://adminconsole:3000'
}

setDefaultTimeout(60 * 1000)
setWorldConstructor(CustomWorld)
