import * as ghCore from '@actions/core'
import fsPromises from 'fs/promises'

export class CheckVersion {
  constructor(private core: typeof ghCore, private fs: typeof fsPromises) {}

  async check(location: string) {
    const files = await this.fs.readdir(location)

    if (files.indexOf('package.json') === -1) {
      this.core.setFailed('something')
    }
  }
}
