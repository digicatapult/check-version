import * as core from '@actions/core'
import {wait} from './wait'
import {checkVersion} from './check-version'

import {context} from '@actions/github'

type GithubContext = typeof context

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    const location: string = core.getInput('location')
    // const owner: string = core.getInput('owner')
    // const repo: string = core.getInput('repo')
    // const token: string = core.getInput('token')
    // const pr_number = core.getInput('pr_number')

    console.log('heeelo')

    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())

    core.debug('location')
    const myRepoURL = getRepoURL(context)
    console.log(`This repo's URL is: ${myRepoURL}`)

    await checkVersion(location)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function getRepoURL({repo, serverUrl}: GithubContext): string {
  return `${serverUrl}/${repo.owner}/${repo.repo}`
}

run()
