import * as fs from 'fs/promises'
import {context, getOctokit} from '@actions/github'
import * as semver from 'semver'

type GithubContext = typeof context

export async function checkVersion(
  location: string,
  ghToken: string
): Promise<number> {
  let filepathsX = 0
  let packageJson: any
  let packageLockJson: any
  let newestTag: string | undefined = undefined

  try {
    //get all files in a location
    const files = await fs.readdir(location)
    // const files = await fs.readdir('./__tests__/')

    const filtered = files
      .filter(function (str) {
        return str.includes('package')
      })
      .sort()

    //read and assign files
    for (const file of filtered) {
      const filepath = await getFilePath(file)

      const contents = await fs.readFile(filepath, 'utf8')
      const jsonData = JSON.parse(contents)
      if (file.indexOf('lock') != -1) {
        packageJson = jsonData
      } else {
        packageLockJson = jsonData
      }
    }
    filepathsX = filtered.length

    //comparisons of versions
    if (packageJson['version'] != packageLockJson['version']) {
      throw new Error(`Inconsistent versions detected \n
        PACKAGE_VERSION: ${packageJson['version']}\n
        PACKAGE_LOCK_VERSION: ${packageLockJson['version']}
        `)
    }

    // get tags and compare
    //processing tags
    await getTags(ghToken).then(tags => {
      if (tags) {
        // filter out tags that don't look like releases
        const sortedTaggedVersions = tags
          .filter(t => t.name.match(/\d+.\d+.\d+/))
          .sort((a, b) => semver.compare(a.name, b.name))
        // const sortedTaggedVersions = taggedVersions.sort(semver.compare)

        sortedTaggedVersions.forEach(element => {
          console.log(`
        Your tag: \n
        ${JSON.stringify(element, undefined, 2)}`)
        })
        //newest tag
        newestTag = sortedTaggedVersions[sortedTaggedVersions.length - 1].name
      }
    })

    console.log(`sth`)

    //check if newest tag from repo is less than package
    if (newestTag) {
      throw new Error(`comparison \n
      ${semver.compare(newestTag, packageJson['version'])}`)
    } else {
      throw new Error(`no newest tag`)
    }
  } catch (err) {
    console.error(err)
  }

  return filepathsX
}

async function getFilePath(file: string): Promise<string> {
  return './__tests__/' + file
}

async function getTags(ghToken: string) {
  if (ghToken) {
    const octokit = getOctokit(ghToken)

    const result = await octokit.rest.repos.listTags({
      repo: context.repo.repo,
      owner: context.repo.owner
    })
    // console.log(result)

    return result.data || []
  }
}
