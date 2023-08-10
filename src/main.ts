import * as core from '@actions/core'
import {wait} from './wait'
import {checkVersion} from './check-version'
const github = require('@actions/github')

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    const location: string = core.getInput('location')
    const owner: string = core.getInput('owner')
    const repo: string = core.getInput('repo')
    const token: string = core.getInput('token')
    const pr_number = core.getInput('pr_number')

    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())

    core.debug('location')

    //instance of octokit to call GitHub's Rest API
    const octokit = new github.getOctokit(token)
    const {data: changedFiles} = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pr_number
    })
    console.log('====================')
    console.log(changedFiles)
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr_number,
      body: `
        Pull Request #${pr_number} has been updated with: \n
        just some stuff here to see if it works 

      `
    })

    await checkVersion(location)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
