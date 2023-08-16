import * as fs from 'fs/promises'
import {context, getOctokit} from '@actions/github'
import * as semver from 'semver'
import * as core from '@actions/core'

import {z} from 'zod'

import {GetFiles} from './getFiles'
import {GetTags} from './getTags'
import {CheckVersion} from './checkVersion_new'

const packageParser = z.object({
  version: z.string()
})
type tag = {
  name: string
  commit: {
    sha: string
    url: string
  }
  zipball_url: string
  tarball_url: string
  node_id: string
}

export async function checkVersion(location: string, ghToken: string) {
  let packageJson: {version: string} | null = null
  let packageLockJson: any
  let newestTag: string | undefined = undefined
  let sortedTaggedVersions: tag[] = []

  try {
    //get all files in a location
    const getFiles = new GetFiles(fs)
    const filtered = await getFiles.getFiles(location)

    //read and assign files
    for (const file of filtered) {
      // const filepath = await getFilePath(file, location)

      const contents = await fs.readFile(location + file, 'utf8')
      const jsonData = JSON.parse(contents)
      if (file.indexOf('lock') != -1) {
        packageJson = packageParser.parse(jsonData)
      } else {
        packageLockJson = jsonData
      }
    }

    if (packageJson === null) {
      //change to set failed
      core.setFailed('No package.json file found')
      return
    }

    //comparisons of versions in package and package-lock - fail if not the same
    const vCompare = new CheckVersion(core, fs)
    vCompare.compareVersions(packageJson['version'], packageLockJson['version'])
    if (packageJson['version'] != packageLockJson['version']) {
    }

    //processing tags
    const getTags = new GetTags(context, getOctokit)
    const tags: tag[] = await getTags.getTagsFromGithub(ghToken)

    if (tags) {
      // filter out tags that don't look like releases
      sortedTaggedVersions = await vCompare.filterTags(tags)
    }

    //newest tag from repo
    newestTag = sortedTaggedVersions[sortedTaggedVersions.length - 1].name

    //assert comparisons to newest tag
    const isNewRelease: Promise<Boolean> = vCompare.assertComparisons(
      newestTag,
      packageJson['version']
    )
    //   if (semver.compare(newestTag, packageJson['version']) == 1) {
    //     core.setOutput('is_new_version', false)
    //     core.setFailed(
    //       `Newest tag: ${newestTag} is a higher version than package.json: ${packageJson['version']}`
    //     )
    //   } else if (semver.compare(newestTag, packageJson['version']) == -1) {
    //     core.setOutput('version', packageJson['version'])
    //     core.setOutput('is_new_version', true)
    //     core.setOutput('build_date', new Date())

    //     console.log(
    //       `Newest tag: ${newestTag} is a lower version than package.json: ${packageJson['version']} \n so we must be releasing new version`
    //     )
    //   } else if (semver.compare(newestTag, packageJson['version']) == 0) {
    //     core.setOutput('is_new_version', false)
    //     core.setOutput('is_prerelease', false)
    //     core.setFailed(
    //       `Newest tag: ${newestTag} is the same version as package.json: ${packageJson['version']} so not a new version`
    //     )
    //   } else {
    //     core.setFailed(`no newest tag`)
    //   }
  } catch (err) {
    console.error(err)
  }
}
