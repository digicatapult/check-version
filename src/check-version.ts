import * as fs from 'fs/promises'
import {get} from 'https'

export async function checkVersion(location: string) {
  var filepathsX = 0
  var packageJson: any
  var packageLockJson: any

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
    if (!(packageJson['version'] === packageLockJson['version'])) {
      throw new Error(`Inconsistent versions detected \n
        PACKAGE_VERSION: ${packageJson['version']}\n
        PACKAGE_LOCK_VERSION: ${packageLockJson['version']}
        `)
    }
  } catch (err) {
    console.error(err)
  }
  console.log('package json version: ' + packageJson['version'])
  console.log('package lock json version: ' + packageLockJson['version'])
  return filepathsX
}

async function getFilePath(file: string) {
  return './__tests__/' + file
}
