import * as core from '@actions/core'
import {wait} from './wait'
import * as fs from 'fs/promises'
import {CheckVersion} from './checkVersion_new'

type TypeOfCore = typeof core

const ghToken: string = core.getInput('token')
const ms: string = core.getInput('milliseconds')
const location: string = core.getInput('location')

async function run(core: TypeOfCore): Promise<void> {
  try {
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())

    // await checkVersion(location, ghToken)
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion(location, ghToken)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
