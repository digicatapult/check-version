// import * as ghCore from '@actions/core'
import toml from 'toml'
import fsPromises from 'fs/promises'
import { Dirent } from 'fs'

export type AvailableCargos = 'node' | 'runtime'
export type CargoPackages = {
  [key: string]: CargoPackage
}
type CargoPackage =  {
  name: string,
  version: string,
  dependencies?: string[],
}


export default class Cargo {
  constructor(
    // private core: typeof ghCore,
    private fs: typeof fsPromises
  ) {
    // this.core = core
    this.fs = fs
  }

  async getPackageDetails(location: string) {
    const raw: string = await this.fs.readFile(location, 'utf8')
    const { dependencies, ...rest } = toml.parse(raw)

    return {
      name: rest.package.name,
      version: rest.package.version,
      dependencies,
    }
  }

  async recursiveScan(dir: string): Promise<any> {
    const dirs: Dirent[] = await this.fs.readdir(dir, { withFileTypes: true })
    const files: string[] = await Promise.all(dirs.map((dirent: any) =>
      dirent.isDirectory() ? this.recursiveScan(dirent) : dirent
    ))

    return Promise.resolve(files.filter((name: string) => name.includes('toml')))
  }

  async scan(location: string, names: AvailableCargos[] = [], dependency: boolean = false): Promise<CargoPackages | CargoPackage> {
    if (dependency) return this.recursiveScan(location)

    const packages: CargoPackage[] = await Promise.all(names.map((name: AvailableCargos) =>
      this.getPackageDetails(`${location}${name}/Cargo.toml`)
    ))

    if (packages?.length < 1) throw new Error('no packages found')
    if (packages?.length === 1) return packages[0]

    console.log({ packages })

    return packages.reduce((out, next) => ({
      ...out,
      [next.name]: next
    }), {})
  }
}