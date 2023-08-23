import * as core from '@actions/core'
import * as fs from 'fs/promises'
import {CheckVersion} from './checkVersion'

type TypeOfCore = typeof core

const ghToken: string = core.getInput('token')
const location: string = core.getInput('npm_package_location')
const failOnSameVersion = Boolean(core.getInput('fail_on_same_version'))

async function run(core: TypeOfCore): Promise<void> {
  try {
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion(location, ghToken, failOnSameVersion)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
