import { Command, flags } from '@oclif/command'
import { join } from 'path'
import chalk from 'chalk'
import cli from 'cli-ux'
import execa from 'execa'

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

    this.log('### Kuzzle Admin Console End to End tests ###')

    switch (flags.backend) {
      case '1':
      case '2':
        await this.singleBackend(flags.backend)
        break
      case 'multi':
      default:
        await this.multiBackend()
        break
    }
  }

  async singleBackend(version: string) {
    this.log(` Running single backend tests with Kuzzle v${version}`)
    const docoFile = join('..', `stack-v${version}.yml`)
    cli.action.start(` Kuzzle version ${version} is launching`, undefined, {
      stdout: true
    })
    await execa('docker-compose', [
      '-f',
      docoFile,
      '-p',
      `stack-${version}`,
      'up',
      '-d'
    ]).stderr.pipe(process.stdout)
  }

  async multiBackend() {
    this.log(' Running multi-backend tests')
  }
}

export = RunTest
