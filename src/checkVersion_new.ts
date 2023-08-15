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
}
