import * as core from '@actions/core'
import * as fs from 'fs/promises'
import {CheckVersion} from './lib/checkVersion'
import {stringToBoolean} from './util'

type TypeOfCore = typeof core
export type ManagerType = 'npm' | 'cargo' 

const ghToken: string = core.getInput('token')
const npmLocation: string = core.getInput('npm_package_location')
const cargoLocation: string = core.getInput('cargo_package_location')
const failOnSameVersion: string = core.getInput('fail_on_same_version')
const manager: ManagerType = npmLocation ? 'npm' : 'cargo'


async function run(core: TypeOfCore): Promise<void> {
  try {
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion({
      location: npmLocation || cargoLocation,
      ghToken,
      failOnSameVersion: stringToBoolean(failOnSameVersion),
      manager
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
