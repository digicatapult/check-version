import * as core from '@actions/core'
import {wait} from './wait'
import {checkVersion} from './check-version'

const ghToken: string = core.getInput('token')
// const pr_number = core.getInput('pr_number')
const ms: string = core.getInput('milliseconds')
const location: string = core.getInput('location')

async function run(): Promise<void> {
  try {
    console.log('heeelo')

    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())

    await checkVersion(location, ghToken)
    console.log(`after check version`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
