import fsPromises from 'fs/promises'
var toml = require('toml')

export default class PoetryHandler {
  constructor(private fs: typeof fsPromises) {
    this.fs = fs
  }

  async scan(location: string) {
    const name = 'pyproject.toml'
    const contents: string = await this.fs.readFile(location + name, 'utf8')
    const data = toml.parse(contents)
    return data['tool']['poetry']['version']
  }
}
