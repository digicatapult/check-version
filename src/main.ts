import * as core from '@actions/core'
import {wait} from './wait'
import {checkVersion} from './check-version'

import {context, getOctokit} from '@actions/github'

type GithubContext = typeof context

const ghToken: string = core.getInput('token')
// const pr_number = core.getInput('pr_number')
const ms: string = core.getInput('milliseconds')
const location: string = core.getInput('location')

async function run(): Promise<void> {
  try {
    console.log('heeelo')

    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())

    core.debug('location')
    const myRepoURL = getRepoURL(context)
    console.log(`This repo's URL is: ${myRepoURL}`)

    getDiff().then(files => {
      if (files) {
        files.forEach(element => {
          console.log(`
        Your tag is: \n
        ${JSON.stringify(element, undefined, 2)}`)
        })
      }
    })

    await checkVersion(location)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function getRepoURL({repo, serverUrl}: GithubContext): string {
  return `${serverUrl}/${repo.owner}/${repo.repo}`
}
async function getDiff() {
  if (ghToken && context.payload.pull_request) {
    const octokit = getOctokit(ghToken)

    const result = await octokit.rest.repos.listTags({
      repo: context.repo.repo,
      owner: context.repo.owner
    })

    // const result = await octokit.rest.repos.compareCommits({
    //     repo: context.repo.repo,
    //     owner:context.repo.owner,
    //     head: context.payload.pull_request.head.sha,
    //     base: context.payload.pull_request.base.sha,
    //     page: 100
    // })
    return result.data || []
  }
}

run()
