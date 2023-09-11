import * as ghCore from '@actions/core'
import fsPromises from 'fs/promises'
import * as semver from 'semver'
import {GetFiles} from './getFiles'
import {z} from 'zod'
import {GetTags} from './getTags'
import {context, getOctokit} from '@actions/github'
import { ManagerType } from '../main'
import Cargo, { AvailableCargos } from './Cargo'


type Tag = {
  name: string
  commit: {
    sha: string
    url: string
  }
  zipball_url: string
  tarball_url: string
  node_id: string
}
const packageParser = z.object({
  version: z.string()
})

export class CheckVersion {
  constructor(
    private core: typeof ghCore,
    private fs: typeof fsPromises
  ) {}

  async checkVersion(
    location: string,
    ghToken: string,
    failOnSameVersion: boolean,
    manager: ManagerType = 'npm',
    names: AvailableCargos[] = ['node']
  ) {

    let newestTag: string | undefined = undefined
    let sortedTaggedVersions: Tag[] = []

    try {
      const _version: string = await this.getVersion(manager, location, names) 
      //processing tags
      const getTags = new GetTags(context, getOctokit)
      const tags: Tag[] = await getTags.getTagsFromGithub(ghToken)

      if (tags.length > 0) {
        // filter out tags that don't look like releases
        sortedTaggedVersions = await this.filterTags(tags)

        //newest tag from repo
        newestTag = sortedTaggedVersions[sortedTaggedVersions.length - 1].name

        //assert comparisons to newest tag
        const isNewVersion: Promise<Boolean> = this.assertComparisons(
          newestTag,
          _version,
          failOnSameVersion
        )
        return isNewVersion
      } else {
        this.core.setOutput('version', _version)
        this.core.setOutput('is_new_version', true)
        this.core.setOutput('build_date', new Date())

        console.log(
          `There are no remote tags, your local version: ${_version} is the most recent.`
        )
        return true
      }
    } catch (err) {
      console.error(err)
    }
  }

  getVersion(manager: ManagerType, location: string, names: AvailableCargos[]) {
    if (manager === 'cargo') return this.handleCargo(location, names)
    if (manager === 'npm') return this.handlePackageJson(location)

    throw new Error(`unknown manager type - [${manager}]`)
  }

  async handleCargo(location: string, names: AvailableCargos[]) {
    const cargo: Cargo = new Cargo(this.fs)
    const result = await cargo.scan(location, names)

    console.log({ result }, ' cargo')
    // if single package result version
    if (result) return result.version
    
    return result 
  }

  async handlePackageJson(location: string, packageJson: {version?: string} | null = null, packageLockJson: any = null) {
    const getFiles = new GetFiles(this.fs)
    const filtered = await getFiles.getFiles(location)
  
    //read and assign files
    for (const file of filtered) {
      const contents = await this.fs.readFile(location + file, 'utf8')
      const jsonData = JSON.parse(contents)
      if (file.indexOf('lock') != -1) {
        packageJson = packageParser.parse(jsonData)
      } else {
        packageLockJson = packageParser.parse(jsonData)
      }
    }
  
    if (packageJson === null) {
      //change to set failed
      return
    }
  
    this.compareVersions(packageJson['version'] || '', packageLockJson['version'] || '')
  
    return packageLockJson['version'] 
  }

  async compareVersions(packageJson: string, packageLock: undefined | string) {
    if (packageJson !== packageLock) {
      this.core.setFailed(`Inconsistent versions detected \n
        PACKAGE_VERSION: ${packageJson}\n
        PACKAGE_LOCK_VERSION: ${packageLock}
        `)
    }
  }

  async filterTags(tags: Tag[]) {
    let taggedVersions: Tag[] = []
    try {
      taggedVersions = tags
        .filter(t => t.name.match(/\d+.\d+.\d+/))
        .sort((a, b) => semver.compare(a.name, b.name))
    } catch (err) {
      this.core.setFailed(`Error while filtering tags: ${err}`)
    }
    return taggedVersions
  }

  async assertComparisons(
    newestGithubTag: string,
    packageTag: string,
    failOnSameVersion = true
  ): Promise<boolean> {
    const isPrerelease = packageTag.includes('-')

    this.core.setOutput('build_date', new Date())
    this.core.setOutput('version', `v${packageTag}`)
    this.core.setOutput('is_prerelease', isPrerelease)
    this.core.setOutput('npm_release_tag', isPrerelease ? 'next' : 'latest')

    if (semver.compare(newestGithubTag, packageTag) === 1) {
      this.core.setOutput('is_new_version', false)

      this.core.setFailed(
        `Newest tag: ${newestGithubTag} is a higher version than package.json: ${packageTag}`
      )
      return false
    } else if (semver.compare(newestGithubTag, packageTag) === -1) {
      this.core.setOutput('is_new_version', true)

      console.log(
        `Newest tag: ${newestGithubTag} is a lower version than package.json: ${packageTag} \n so we must be releasing new version`
      )
      return true
    } else if (semver.compare(newestGithubTag, packageTag) === 0) {
      this.core.setOutput('is_new_version', false)

      console.log(
        `Newest tag: ${newestGithubTag} is the same version as package.json: ${packageTag} so not a new version`
      )

      if (failOnSameVersion) {
        this.core.setFailed(`Failing on same version`)
        return false
      }

      return true
    } else {
      this.core.setFailed(`no newest tag`)
      return false
    }
  }
}
