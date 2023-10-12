import * as core from '@actions/core'
import * as fs from 'fs/promises'
import {CheckVersion} from './lib/checkVersion'
import {stringToBoolean} from './util'

type TypeOfCore = typeof core
export type ManagerType = 'npm' | 'cargo' | 'poetry' | undefined

const ghToken: string = core.getInput('token')
const npmLocation: string = core.getInput('npm_package_location')
const cargoLocation: string = core.getInput('cargo_package_location')
const poetryLocation: string = core.getInput('poetry_package_location')
const failOnSameVersion: string = core.getInput('fail_on_same_version')
const manager = npmLocation
  ? 'npm'
  : cargoLocation
  ? 'cargo'
  : poetryLocation
  ? 'poetry'
  : undefined

async function run(core: TypeOfCore): Promise<void> {
  try {
    if (manager == undefined) {
      core.setFailed(`Manager is undefined`)
    }
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion({
      location: npmLocation || cargoLocation || poetryLocation,
      ghToken,
      failOnSameVersion: stringToBoolean(failOnSameVersion),
      manager
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
