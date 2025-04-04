// import * as ghCore from '@actions/core'
import toml from 'toml'
import fsPromises from 'fs/promises'

export type CargoPackages = {
  [key: string]: CargoPackage
}

export type CargoPackage = {
  name: string
  version: string
  dependencies?: string[]
}

// TODO use implements Interface {}
export default class Cargo {
  constructor(private fs: typeof fsPromises) {
    this.fs = fs
  }

  /**
   * retrieves package details
   * @param {String} location - takes a full path of file
   * @returns {Object} - formatted package details
   */
  async getPackageDetails(location: string): Promise<CargoPackage> {
    const raw: string = await this.fs.readFile(location, 'utf8')
    const { dependencies, ...rest } = toml.parse(raw)

    return {
      name: rest.package.name,
      version: rest.package.version,
      dependencies,
    }
  }

  /**
   *
   * @param location - package location
   * @returns - version
   */
  async scan(location: string): Promise<CargoPackage> {
    return this.getPackageDetails(`${location}/Cargo.toml`)
  }
}
