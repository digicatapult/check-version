import * as ghCore from '@actions/core'
import fsPromises from 'fs/promises'
import { Dirent } from 'fs'

export default class Cargo {
  private all: boolean = false
  private package: {
    name: string,
    version: string,
    dependencies?: string[],
  } | undefined = undefined

  constructor(
    private core: typeof ghCore,
    private fs: typeof fsPromises
  ) {
    this.core = core
    this.fs = fs
  }

  async parse(buf: any) {
    console.log({ buf })
    /**
     * ...map(el.... => {
     *   const utf8 = await this.fs.readFile(location + file, 'utf8')
     *   comst toml = TOML.parse(utf8)
     * 
     *   return { name, version, dependencies } 
     */
    
    return {
      name: 'a',
      version: '1',
    }
  }

  async walk(dir: string): Promise<any> {
    const dirs: Dirent[] = await this.fs.readdir(dir, { withFileTypes: true })
    const files: string[] = await Promise.all(dirs.map((dirent: any) =>
      dirent.isDirectory() ? this.walk(dirent) : dirent
    ))

    return Promise.resolve(files)
  }

  async scan(location: string, all: boolean = false) {
    if (this.all) return this.walk(location)
    if (!this.package) this.package = await this.parse('a file')
  }
}