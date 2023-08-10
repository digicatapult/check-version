import * as core from '@actions/core'
import {wait} from './wait'
import {checkVersion} from './check-version'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    const location: string = core.getInput('location')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())

    core.debug('location')
    await checkVersion(location)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
