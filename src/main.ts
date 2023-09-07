import * as core from '@actions/core'
import * as fs from 'fs/promises'
import {CheckVersion} from './lib/checkVersion'
import {stringToBoolean} from './util'

type TypeOfCore = typeof core
export type ManagerType = 'npm' | 'cargo'

const ghToken: string = core.getInput('token')
const location: string = core.getInput('package_location')
const failOnSameVersion = core.getInput('fail_on_same_version')
const manager: ManagerType = core.getInput('package_manager') as ManagerType


async function run(core: TypeOfCore): Promise<void> {
  try {
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion(
      location,
      ghToken,
      stringToBoolean(failOnSameVersion),
      manager
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
