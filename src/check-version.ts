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
type Tag = {
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
  let sortedTaggedVersions: Tag[] = []
  const checkVersion = new CheckVersion(core, fs)

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
      return
    }

    //comparisons of versions in package and package-lock - fail if not the same
    // compareVersions(packageJson['version'], packageLockJson['version'])
    // if (packageJson['version'] != packageLockJson['version']) {
    // }
    checkVersion.compareVersions(
      packageJson['version'],
      packageLockJson['version']
    )

    //processing tags
    const getTags = new GetTags(context, getOctokit)
    const tags: Tag[] = await getTags.getTagsFromGithub(ghToken)

    if (tags) {
      // filter out tags that don't look like releases
      const sortedTaggedVersions = checkVersion.filterTags(tags)
    }

    //newest tag from repo
    newestTag = sortedTaggedVersions[sortedTaggedVersions.length - 1].name

    //assert comparisons to newest tag

    const isNewVersion: Promise<Boolean> = checkVersion.assertComparisons(
      newestTag,
      packageLockJson['version']
    )
  } catch (err) {
    console.error(err)
  }
}

// async function compareVersions(packageJson: string, packageLock: string) {
//   if (packageJson != packageLock) {
//     return core.setFailed(`Inconsistent versions detected \n
//       PACKAGE_VERSION: ${packageJson}\n
//       PACKAGE_LOCK_VERSION: ${packageLock}
//       `)
//   }
// }

// async function filterTags(tags: Tag[]) {
//   const taggedVersions = tags
//     .filter(t => t.name.match(/\d+.\d+.\d+/))
//     .sort((a, b) => semver.compare(a.name, b.name))
//   return taggedVersions
// }
