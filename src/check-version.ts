import * as fs from 'fs/promises'
import {context, getOctokit} from '@actions/github'
import * as semver from 'semver'
import * as core from '@actions/core'

type GithubContext = typeof context

export async function checkVersion(location: string, ghToken: string) {
  let filepathsX = 0
  let packageJson: any
  let packageLockJson: any
  let newestTag: string | undefined = undefined
  let sortedTaggedVersions: {
    name: string
    commit: {sha: string; url: string}
    zipball_url: string
    tarball_url: string
    node_id: string
  }[] = []

  try {
    //get all files in a location
    const files = await fs.readdir(location)
    // const files = await fs.readdir('./__tests__/')

    const filtered = files
      .filter(function (str) {
        return str.includes('package')
      })
      .sort()

    //read and assign files
    for (const file of filtered) {
      const filepath = await getFilePath(file)

      const contents = await fs.readFile(filepath, 'utf8')
      const jsonData = JSON.parse(contents)
      if (file.indexOf('lock') != -1) {
        packageJson = jsonData
      } else {
        packageLockJson = jsonData
      }
    }
    filepathsX = filtered.length

    //comparisons of versions
    // if (packageJson['version'] != packageLockJson['version']) {
    //   throw new Error(`Inconsistent versions detected \n
    //     PACKAGE_VERSION: ${packageJson['version']}\n
    //     PACKAGE_LOCK_VERSION: ${packageLockJson['version']}
    //     `)
    // }
    if (packageJson['version'] != packageLockJson['version']) {
      console.log(`Inconsistent versions detected \n
        PACKAGE_VERSION: ${packageJson['version']}\n
        PACKAGE_LOCK_VERSION: ${packageLockJson['version']}
        `)
    }

    // get tags and compare
    //processing tags
    await getTags(ghToken).then(tags => {
      if (tags) {
        // filter out tags that don't look like releases
        const taggedVersions = tags
          .filter(t => t.name.match(/\d+.\d+.\d+/))
          .sort((a, b) => semver.compare(a.name, b.name))

        // taggedVersions.forEach(async element => {
        //   console.log(`
        // Your tag: \n
        // ${JSON.stringify(element, undefined, 2)}`)
        // })

        sortedTaggedVersions = taggedVersions
      }
    })

    //newest tag
    newestTag = sortedTaggedVersions[sortedTaggedVersions.length - 1].name
    console.log(`newest tag` + newestTag)

    console.log(`sth`)

    //check if newest tag from repo is less than package
    if (semver.compare(newestTag, packageJson['version']) == 1) {
      console.log(
        `Newest tag: ${newestTag} is a higher version than package.json: ${packageJson['version']}`
      )
      return core.setFailed(
        `Newest tag: ${newestTag} is a higher version than package.json: ${packageJson['version']}`
      )
    } else if (semver.compare(newestTag, packageJson['version']) == -1) {
      console.log(
        `Newest tag: ${newestTag} is a lower version than package.json: ${packageJson['version']} \n so we must be releasing new version`
      )
    } else if (semver.compare(newestTag, packageJson['version']) == 0) {
      console.log(
        `Newest tag: ${newestTag} is the same version as package.json: ${packageJson['version']} so not a new version`
      )
    } else {
      console.log(`no newest tag`)
    }
  } catch (err) {
    console.error(err)
  }

  // return filepathsX
}

async function getFilePath(file: string): Promise<string> {
  return './__tests__/' + file
}

async function getTags(ghToken: string) {
  if (ghToken) {
    const octokit = getOctokit(ghToken)

    const result = await octokit.rest.repos.listTags({
      repo: context.repo.repo,
      owner: context.repo.owner
    })
    // console.log(result)

    return result.data || []
  }
}
