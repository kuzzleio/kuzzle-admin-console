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
    help: flags.help({ char: 'h' }),
    backend: flags.enum({ options: ['1', '2', 'multi'], default: '2' }),
    local: flags.boolean({ default: false }),
    spec: flags.string({ char: 's', multiple: true, default: [] }),
    tag: flags.string({ multiple: true, default: []})
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
        await this.singleBackend(flags.backend, flags.local, flags.spec, flags.tag)
        break
      case 'multi':
      default:
        await this.multiBackend(flags.local, flags.tag)
        break
    }
  }

  async singleBackend(backend: string, local: boolean = false, specs: String[], tags: String[]) {
    this.log(
      chalk.blueBright(
        ` Preparing single-backend stack with Kuzzle v${backend}`
      )
    )

    const tasks = new Listr([
      {
        title: `Launch Kuzzle version ${backend}`,
        skip: () => {
          if (local) {
            return 'Using local Kuzzle'
          }
        },
        task: () => {
          const docoFile = join(
            process.cwd(),
            'test',
            'e2e',
            `stack-v${backend}.yml`
          )
          const doco = execa('docker-compose', [
            '-f',
            docoFile,
            '-p',
            `stack-${backend}`,
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
      backend,
      process.env.CYPRESS_RECORD_KEY,
      false,
      specs,
      tags
    )
    this.log(npmArgs.join())
    try {
      const cy = execa('cypress', npmArgs, {
        env: {
          CYPRESS_BACKEND_VERSION: backend
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

  async multiBackend(local: boolean = false, tags: String[]) {
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
      true,
      [],
      tags
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
    backend: string,
    recordKey: String | undefined,
    multi: boolean,
    specs: String[],
    tags: String[]
  ) {
    if (local) {
      return ['open']
    }

    const cypressArgs: string[] = ['run'];
    if (recordKey) {
      cypressArgs.push('--record')

      cypressArgs.push('--group')
      const group: string = backend === 'multi-backend' ? backend : `kuzzle-v${backend}`
      cypressArgs.push(group)
      if (tags.length !== 0) {
        cypressArgs.push('--tag')
        cypressArgs.push(tags.join())
      }
    }
    let specsArg = ''
    if (specs.length !== 0 && backend !== 'multi-backend') {
      specsArg = specs.map(s => `test/e2e/cypress/integration/single-backend/${s}.spec.js`).join()
    } else {
      specsArg =
        `test/e2e/cypress/integration/${
          multi ? 'multi-backend' : 'single-backend'
        }/*.spec.js`
    }
    cypressArgs.push("--spec")
    cypressArgs.push(specsArg)

    return cypressArgs
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
