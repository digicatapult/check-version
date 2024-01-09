import * as ghCore from '@actions/core'
import fsPromises from 'fs/promises'
import * as semver from 'semver'
import {context, getOctokit} from '@actions/github'

import {GetTags} from './getTags.js'
import Cargo from './Cargo/index.js'
import NPMPackageHandler from './npm/index.js'
import PoetryHandler from './Poetry/index.js'

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

export class CheckVersion {
  constructor(
    private core: typeof ghCore,
    private fs: typeof fsPromises
  ) {}

  async checkVersion({
    location,
    ghToken,
    failOnSameVersion,
    manager
  }: {
    location: string
    ghToken: string
    failOnSameVersion: boolean
    manager: string
  }) {
    let newestTag: string | undefined = undefined
    let sortedTaggedVersions: Tag[] = []

    try {
      const version: string = await this.getVersion(manager, location)
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
          version,
          failOnSameVersion,
          manager
        )
        return isNewVersion
      } else {
        this.core.setOutput('version', version)
        this.core.setOutput('is_new_version', true)
        this.core.setOutput('build_date', new Date())

        console.log(
          `There are no remote tags, your local version: ${version} is the most recent.`
        )
        return true
      }
    } catch (err) {
      console.error(err)
    }
  }

  getVersion(manager: string, location: string) {
    switch (manager) {
      case 'cargo':
        return this.handleCargo(location)
      case 'npm':
        return this.handlePackageJson(location)
      case 'poetry':
        return this.handlePoetry(location)
      default:
        throw new Error(`unknown manager type - [${manager}]`)
    }
  }

  async handleCargo(location: string) {
    const cargo: Cargo = new Cargo(this.fs)
    const result = await cargo.scan(location)

    if (result) return result.version

    return result
  }

  async handlePackageJson(location: string) {
    const npmHandler = new NPMPackageHandler(this.fs, this.core)
    const result = await npmHandler.scan(location)

    return result
  }
  async handlePoetry(location: string) {
    const poetryHandler = new PoetryHandler(this.fs)
    const result = await poetryHandler.scan(location)

    return result
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
    failOnSameVersion = true,
    manager: string
  ): Promise<boolean> {
    const isPrerelease = packageTag.includes('-')

    this.core.setOutput('build_date', new Date())
    this.core.setOutput('version', `v${packageTag}`)
    this.core.setOutput('is_prerelease', isPrerelease)

    if (manager === 'npm') {
      this.core.setOutput('npm_release_tag', isPrerelease ? 'next' : 'latest')
    }

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
