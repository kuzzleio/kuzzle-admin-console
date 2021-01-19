import { Command, flags } from '@oclif/command'
import chalk from 'chalk'
import execa from 'execa'
import Listr from 'listr'
import emoji from 'node-emoji'
import { join } from 'path'
import rp from 'request-promise'
import http from 'http'
import nodeStatic from 'node-static'

class RunTest extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    backend: flags.enum({ options: ['1', '2', 'multi'], default: '2' }),
    local: flags.boolean({ default: false })
  }

  async run() {
    const { flags } = this.parse(RunTest)

    this.log(
      chalk.bold(
        ` ${emoji.get('robot_face')}  Kuzzle Admin Console End to End tests\n`
      )
    )

    switch (flags.backend) {
      case '1':
      case '2':
        await this.singleBackend(flags.backend, flags.local)
        break
      case 'multi':
      default:
        await this.multiBackend(flags.local)
        break
    }
  }

  async singleBackend(version: string, local: boolean = false) {
    this.log(
      chalk.blueBright(
        ` Preparing single-backend stack with Kuzzle v${version}`
      )
    )

    const tasks = new Listr([
      {
        title: `Launch Kuzzle version ${version}`,
        skip: () => {
          if (local) {
            return 'Using local Kuzzle'
          }
          return 'Using local Kuzzle'
        },
        task: () => {
          const docoFile = join(
            process.cwd(),
            'test',
            'e2e',
            `stack-v${version}.yml`
          )
          const doco = execa('docker-compose', [
            '-f',
            docoFile,
            '-p',
            `stack-${version}`,
            'up',
            '-d'
          ])
          // doco.stderr.pipe(process.stderr)
          // doco.stdout.pipe(process.stdout)

          return doco.stdout
        }
      },
      {
        title: 'Wait for Kuzzle to be up',
        task: () => {
          const kuzzleUrl = `http://localhost:${process.env.KUZZLE_PORT ||
            7512}`
          return this.waitFor('Kuzzle', kuzzleUrl)
        }
      },
      {
        title: `Build and serve the Admin Console`,
        skip: () => {
          if (local) {
            return 'Using local Admin Console'
          }
        },
        task: () => this.buildAndServeAdminConsole()
      },
      {
        title: 'Wait for the Admin Console to be up',
        task: () => this.waitFor('the Admin Console', 'http://localhost:8080')
      }
    ])

    await tasks.run()

    this.log(
      chalk.blueBright(
        `\n ${emoji.get('raised_hands')} Stack is up. Ready to run the tests!`
      )
    )

    const npmArgs = this.buildCypressArgs(
      local,
      version,
      process.env.CYPRESS_RECORD_KEY,
      false
    )
    try {
      const cy = execa('cypress', npmArgs, {
        env: {
          CYPRESS_BACKEND_VERSION: version
        }
      })
      cy.stdout.pipe(process.stdout)
      cy.stderr.pipe(process.stderr)

      const exitCode = (await cy).exitCode
      process.exit(exitCode)
    } catch (error) {
      this.log(`\n ${emoji.get('red_circle')} Sorry, tests are red.`)
      process.exit(1)
    }
  }

  async multiBackend(local: boolean = false) {
    this.log(chalk.blueBright(` Preparing multi-backend stack`))

    const tasks = new Listr([
      {
        title: `Build and serve the Admin Console`,
        skip: () => {
          if (local) {
            return 'Using local Admin Console'
          }
        },
        task: () => this.buildAndServeAdminConsole()
      },
      {
        title: 'Wait for the Admin Console to be up',
        task: () => this.waitFor('the Admin Console', 'http://localhost:8080')
      }
    ])

    await tasks.run()

    this.log(
      chalk.blueBright(
        `\n ${emoji.get('raised_hands')} Stack is up. Ready to run the tests!`
      )
    )
    const npmArgs = this.buildCypressArgs(
      local,
      'multi-backend',
      process.env.CYPRESS_RECORD_KEY,
      true
    )
    try {
      const cy = execa('cypress', npmArgs, {
        env: {
          CYPRESS_RETRIES: local ? '1' : '3'
        }
      })
      cy.stdout.pipe(process.stdout)
      cy.stderr.pipe(process.stderr)

      const exitCode = (await cy).exitCode
      process.exit(exitCode)
    } catch (error) {
      this.log(`\n ${emoji.get('red_circle')} Sorry, tests are red.`)
      process.exit(1)
    }
  }

  async buildAndServeAdminConsole() {
    await execa('npm', ['run', 'build'])
    const file = new nodeStatic.Server('./dist')
    http
      .createServer((request, response) => {
        request
          .addListener('end', () => {
            file.serve(request, response)
          })
          .resume()
      })
      .listen(8080)
  }

  buildCypressArgs(
    local: boolean,
    version: String,
    recordKey: String | undefined,
    multi: boolean
  ) {
    return local
      ? ['open']
      : [
          'run',
          recordKey ? '--record' : '',
          '--spec',
          `test/e2e/cypress/integration/${
            multi ? 'multi-backend' : 'single-backend'
          }/*.spec.js`,
          recordKey ? '--group' : '',
          recordKey ? `kuzzle-v${version}` : ''
        ]
  }

  async waitFor(name: string, uri: string) {
    const MAX_REQUESTS = 100

    for (let i = MAX_REQUESTS; i > 0; i--) {
      await wait(1000)
      try {
        const response = await rp({
          method: 'GET',
          uri,
          resolveWithFullResponse: true
        })
        if (response.statusCode === 200) {
          return
        }
      } catch (error) {
        process.stdout.write('. ')
      }
    }

    throw new Error(`Unable to reach ${name} at ${uri}`)
  }
}

const wait = (ms: number) =>
  new Promise(resolve => {
    setTimeout(() => resolve(true), ms)
  })

export = RunTest
