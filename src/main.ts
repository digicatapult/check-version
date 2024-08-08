import * as core from '@actions/core'
import * as fs from 'fs/promises'
import {CheckVersion} from './lib/checkVersion.js'
import {assignManager, stringToBoolean} from './util.js'

type TypeOfCore = typeof core

const ghToken: string = core.getInput('token')
const packageManager: string = core.getInput('package_manager')
const npmLocation: string = core.getInput('npm_package_location')
const cargoLocation: string = core.getInput('cargo_package_location')
const poetryLocation: string = core.getInput('poetry_package_location')
const failOnSameVersion: string = core.getInput('fail_on_same_version')
const tagRegex: string = core.getInput('tag_regex')

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
      manager: selectManager.manager,
      tagRegex
    })

    const outputsFilePath = process.env['GITHUB_OUTPUT']
    if (outputsFilePath) console.log(await fs.readFile(outputsFilePath, 'utf8'))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
