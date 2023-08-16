import * as ghCore from '@actions/core'
import fsPromises from 'fs/promises'
import * as semver from 'semver'

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

export class CheckVersion {
  constructor(private core: typeof ghCore, private fs: typeof fsPromises) {}

  async check(location: string) {
    const files = await this.fs.readdir(location)

    if (files.indexOf('package.json') === -1) {
      this.core.setFailed('something')
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

  async filterTags(tags: tag[]) {
    const taggedVersions = tags
      .filter(t => t.name.match(/\d+.\d+.\d+/))
      .sort((a, b) => semver.compare(a.name, b.name))
    return taggedVersions
  }

  async assertComparisons(
    newestGithubTag: string,
    packageTag: string
  ): Promise<Boolean> {
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
