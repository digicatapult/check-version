import fsPromises from 'fs/promises'
import toml from 'toml'

export default class PoetryHandler {
  constructor(private fs: typeof fsPromises) {
    this.fs = fs
  }

  async scan(location: string) {
    const name = 'pyproject.toml'
    const contents: string = await this.fs.readFile(location + name, 'utf8')
    const { dependencies, ...rest } = toml.parse(contents)
    return rest.tool.poetry.version
  }
}
