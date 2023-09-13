// import * as ghCore from '@actions/core'
import toml from 'toml'
import fsPromises from 'fs/promises'
import { Dirent } from 'fs'

export type CargoPackages = {
  [key: string]: CargoPackage
}

type CargoPackage =  {
  name: string,
  version: string,
  dependencies?: string[],
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
   * For working with multiple packages
   * @param {String} dir - directory where .toml file lives
   * @returns {Array} - of .toml files
   */
  async recursiveScan(dir: string): Promise<any> {
    const dirs: Dirent[] = await this.fs.readdir(dir, { withFileTypes: true })
    const files: string[] = await Promise.all(dirs.map((dirent: any) =>
      dirent.isDirectory() ? this.recursiveScan(dirent) : dirent
    ))

    return Promise.resolve(files.filter((name: string) => name.includes('toml')))
  }

  /**
   * 
   * @param location - package location
   * @param dependency - DISABLED, takes whether check across the board
   * @returns - version
   */
  async scan(location: string, dependency: boolean = false): Promise<CargoPackage> {
    if (dependency) return this.recursiveScan(location)

    return this.getPackageDetails(`${location}/Cargo.toml`)
  }
}