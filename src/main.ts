import * as core from '@actions/core'
import * as fs from 'fs/promises'
import {CheckVersion} from './lib/checkVersion'
import {assignManager, stringToBoolean} from './util'

type TypeOfCore = typeof core

const ghToken: string = core.getInput('token')
const npmLocation: string = core.getInput('npm_package_location')
const cargoLocation: string = core.getInput('cargo_package_location')
const poetryLocation: string = core.getInput('poetry_package_location')
const failOnSameVersion: string = core.getInput('fail_on_same_version')

async function run(core: TypeOfCore): Promise<void> {
  try {
    const packageManager = await assignManager(
      npmLocation,
      cargoLocation,
      poetryLocation
    )
    if (!packageManager) {
      throw new Error(
        `There has been an issue while assigning a package manager and location.`
      )
    }
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion({
      location: packageManager.location,
      ghToken,
      failOnSameVersion: stringToBoolean(failOnSameVersion),
      manager: packageManager.manager
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
