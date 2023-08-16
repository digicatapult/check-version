import * as ghCore from '@actions/core'
import fsPromises from 'fs/promises'
import * as semver from 'semver'
import {GetFiles} from './getFiles'
import {z} from 'zod'
import {GetTags} from './getTags'
import {context, getOctokit} from '@actions/github'

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
const packageParser = z.object({
  version: z.string()
})

export class CheckVersion {
  constructor(private core: typeof ghCore, private fs: typeof fsPromises) {}

  async checkVersion(location: string, ghToken: string) {
    let packageJson: {version: string} | null = null
    let packageLockJson: any
    let newestTag: string | undefined = undefined
    let sortedTaggedVersions: Tag[] = []
    // const checkVersion = new CheckVersion(this.core, this.fs)

    try {
      //get all files in a location
      const getFiles = new GetFiles(this.fs)
      const filtered = await getFiles.getFiles(location)

      //read and assign files
      for (const file of filtered) {
        // const filepath = await getFilePath(file, location)

        const contents = await this.fs.readFile(location + file, 'utf8')
        const jsonData = JSON.parse(contents)
        if (file.indexOf('lock') != -1) {
          packageJson = packageParser.parse(jsonData)
        } else {
          packageLockJson = packageParser.parse(jsonData)
        }
      }

      if (packageJson === null) {
        //change to set failed
        return
      }

      this.compareVersions(packageJson['version'], packageLockJson['version'])

      //processing tags
      const getTags = new GetTags(context, getOctokit)
      const tags: Tag[] = await getTags.getTagsFromGithub(ghToken)

      if (tags) {
        // filter out tags that don't look like releases
        sortedTaggedVersions = await this.filterTags(tags)
      }

      //newest tag from repo
      newestTag = sortedTaggedVersions[sortedTaggedVersions.length - 1].name

      //assert comparisons to newest tag

      const isNewVersion: Promise<Boolean> = this.assertComparisons(
        newestTag,
        packageLockJson['version']
      )
    } catch (err) {
      console.error(err)
    }
  }

  async compareVersions(packageJson: string, packageLock: string) {
    if (packageJson != packageLock) {
      this.core.setFailed(`Inconsistent versions detected \n
        PACKAGE_VERSION: ${packageJson}\n
        PACKAGE_LOCK_VERSION: ${packageLock}
        `)
    }
  }

  async filterTags(tags: Tag[]) {
    let taggedVersions: Tag[] = []
    try {
      taggedVersions = tags
        .filter(t => t.name.match(/\d+.\d+.\d+/))
        .sort((a, b) => semver.compare(a.name, b.name))
    } catch (err) {
      this.core.setFailed(`Error while filtering tags: ${err}`)
    }
    return taggedVersions
  }

  async assertComparisons(
    newestGithubTag: string,
    packageTag: string
  ): Promise<boolean> {
    if (semver.compare(newestGithubTag, packageTag) == 1) {
      this.core.setOutput('is_new_version', false)
      this.core.setFailed(
        `Newest tag: ${newestGithubTag} is a higher version than package.json: ${packageTag}`
      )
      return false
    } else if (semver.compare(newestGithubTag, packageTag) == -1) {
      this.core.setOutput('version', packageTag)
      this.core.setOutput('is_new_version', true)
      this.core.setOutput('build_date', new Date())

      console.log(
        `Newest tag: ${newestGithubTag} is a lower version than package.json: ${packageTag} \n so we must be releasing new version`
      )
      return true
    } else if (semver.compare(newestGithubTag, packageTag) == 0) {
      this.core.setOutput('is_new_version', false)
      this.core.setOutput('is_prerelease', false)
      this.core.setFailed(
        `Newest tag: ${newestGithubTag} is the same version as package.json: ${packageTag} so not a new version`
      )
      return false
    } else {
      this.core.setFailed(`no newest tag`)
      return false
    }
  }
}
