import fsPromises from 'fs/promises'

export class GetFiles {
  constructor(private fs: typeof fsPromises) {}

  async getFiles(location: string) {
    let filtered: string[] = []
    try {
      const files = await this.fs.readdir(location) //stubbing readdir function

      filtered = files
        .filter(function (str) {
          return str.includes('package')
        })
        .sort()

      if (files.length < 2) {
        throw new Error(`Package files not found`)
      }
    } catch (err) {
      throw new Error(`${err}`)
    }

    return filtered
  }
}
