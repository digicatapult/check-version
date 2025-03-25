import { getInput, setOutput, setFailed } from '@actions/core'
import * as fs from 'fs/promises'
import { CheckVersion } from './lib/checkVersion.js'
import { assignManager, stringToBoolean } from './util.js'

const gh = { setOutput, setFailed }
export type Github = typeof gh

const ghToken: string = getInput('token')
const packageManager: string = getInput('package_manager')
const npmLocation: string = getInput('npm_package_location')
const cargoLocation: string = getInput('cargo_package_location')
const poetryLocation: string = getInput('poetry_package_location')
const failOnSameVersion: string = getInput('fail_on_same_version')
const tagRegex: string = getInput('tag_regex')

async function run(core: Github): Promise<void> {
  try {
    const selectManager = await assignManager(npmLocation, cargoLocation, poetryLocation, packageManager)
    if (!selectManager) {
      throw new Error(`There has been an issue while assigning a package manager and location.`)
    }
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion({
      location: selectManager.location,
      ghToken,
      failOnSameVersion: stringToBoolean(failOnSameVersion),
      manager: selectManager.manager,
      tagRegex,
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(gh)
