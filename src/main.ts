import * as core from '@actions/core'
import * as fs from 'fs/promises'
import {CheckVersion} from './lib/checkVersion'
import {assignManager, stringToBoolean} from './util'

type TypeOfCore = typeof core

const ghToken: string = core.getInput('token')
const packageManager: string = core.getInput('package_manager')
const npmLocation: string = core.getInput('npm_package_location')
const cargoLocation: string = core.getInput('cargo_package_location')
const poetryLocation: string = core.getInput('poetry_package_location')
const failOnSameVersion: string = core.getInput('fail_on_same_version')

async function run(core: TypeOfCore): Promise<void> {
  try {
    const selectManager = await assignManager(
      npmLocation,
      cargoLocation,
      poetryLocation,
      packageManager
    )
    if (!selectManager) {
      throw new Error(
        `There has been an issue while assigning a package manager and location.`
      )
    }
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion({
      location: selectManager.location,
      ghToken,
      failOnSameVersion: stringToBoolean(failOnSameVersion),
      manager: selectManager.manager
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
