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
    // await checkVersion(location, ghToken)
    const checkVersion = new CheckVersion(core, fs)
    await checkVersion.checkVersion(location, ghToken)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run(core)
