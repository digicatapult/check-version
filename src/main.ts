import * as core from '@actions/core'
import * as fs from 'fs/promises'
import {CheckVersion} from './lib/checkVersion'
import {stringToBoolean} from './util'

type TypeOfCore = typeof core

const ghToken: string = core.getInput('token')
const manager: string = core.getInput('package_manager')
const location: string = core.getInput('location')
const failOnSameVersion: string = core.getInput('fail_on_same_version')

async function run(core: TypeOfCore): Promise<void> {
  try {
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion({
      location: location,
      ghToken,
      failOnSameVersion: stringToBoolean(failOnSameVersion),
      manager
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
