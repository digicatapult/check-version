import fsPromises from 'fs/promises'
import {z} from 'zod'
import * as ghCore from '@actions/core'

const packageParser = z.object({
  version: z.string()
})

export default class NPMPackageHandler {
  constructor(
    private fs: typeof fsPromises,
    private core: typeof ghCore
  ) {
    this.fs = fs
    this.core = core
  }

  async scan(location: string) {
    const files = ['package-lock.json', 'package.json']
    let versions = {packageJson: '', packageJsonLock: ''}
    //read and assign files
    for (const fileName of files) {
      const contents = await this.fs.readFile(location + fileName, 'utf8')
      const jsonData = packageParser.parse(JSON.parse(contents))
      if (jsonData) {
        fileName === 'package-lock.json'
          ? (versions['packageJsonLock'] = jsonData['version'])
          : (versions['packageJson'] = jsonData['version'])
      }
    }
    if (!versions['packageJsonLock'] || !versions['packageJson']) {
      this.core.setFailed(`No versions found for package or package-lock.`)
    }
    this.compareVersions(
      versions['packageJson'] || '',
      versions['packageJsonLock'] || ''
    )

    return versions['packageJsonLock']
  }

  async compareVersions(packageJson: string, packageLock: undefined | string) {
    if (packageJson !== packageLock) {
      this.core.setFailed(`Inconsistent versions detected \n
            PACKAGE_VERSION: ${packageJson}\n
            PACKAGE_LOCK_VERSION: ${packageLock}
            `)
    }
  }
}
