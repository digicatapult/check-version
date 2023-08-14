import * as fs from 'fs/promises'
import {context, getOctokit} from '@actions/github'
import * as semver from 'semver'
import * as core from '@actions/core'

export async function checkVersion(location: string, ghToken: string) {
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

    const filtered = files
      .filter(function (str) {
        return str.includes('package')
      })
      .sort()

    //read and assign files
    for (const file of filtered) {
      // const filepath = await getFilePath(file, location)

      const contents = await fs.readFile(location + file, 'utf8')
      const jsonData = JSON.parse(contents)
      if (file.indexOf('lock') != -1) {
        packageJson = jsonData
      } else {
        packageLockJson = jsonData
      }
    }

    //comparisons of versions - fail if not the same
    if (packageJson['version'] != packageLockJson['version']) {
      return core.setFailed(`Inconsistent versions detected \n
        PACKAGE_VERSION: ${packageJson['version']}\n
        PACKAGE_LOCK_VERSION: ${packageLockJson['version']}
        `)
    }

    //processing tags
    await getTags(ghToken).then(tags => {
      if (tags) {
        // filter out tags that don't look like releases
        const taggedVersions = tags
          .filter(t => t.name.match(/\d+.\d+.\d+/))
          .sort((a, b) => semver.compare(a.name, b.name))

        sortedTaggedVersions = taggedVersions
      }
    })

    //newest tag from repo
    newestTag = sortedTaggedVersions[sortedTaggedVersions.length - 1].name

    //assert comparisons to newest tag
    if (semver.compare(newestTag, packageJson['version']) == 1) {
      return core.setFailed(
        `Newest tag: ${newestTag} is a higher version than package.json: ${packageJson['version']}`
      )
    } else if (semver.compare(newestTag, packageJson['version']) == -1) {
      console.log(
        `Newest tag: ${newestTag} is a lower version than package.json: ${packageJson['version']} \n so we must be releasing new version`
      )
    } else if (semver.compare(newestTag, packageJson['version']) == 0) {
      return core.setFailed(
        `Newest tag: ${newestTag} is the same version as package.json: ${packageJson['version']} so not a new version`
      )
    } else {
      return core.setFailed(`no newest tag`)
    }
  } catch (err) {
    console.error(err)
  }
}

// async function getFilePath(file: string, location: string): Promise<string> {
//   return location + file
// }

async function getTags(ghToken: string) {
  if (ghToken) {
    const octokit = getOctokit(ghToken)

    const result = await octokit.rest.repos.listTags({
      repo: context.repo.repo,
      owner: context.repo.owner
    })

    return result.data || []
  }
}
