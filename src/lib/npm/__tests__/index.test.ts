import sinon from 'sinon'
import fs from 'fs/promises'
import * as core from '@actions/core'
import { describe, test } from 'mocha'
import { expect } from 'chai'

import NPMPackageHandler from '../index.js'

describe('NPM package manager tests: ', function () {
  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore()
  })

  describe('able to read files', () => {
    test('reads files in location errors if it does not find package-lock.json or package.json ', async function () {
      let error: Error | unknown = null
      try {
        const npmPackageHandler = new NPMPackageHandler(fs, core)
        await npmPackageHandler.scan('some/location/')
      } catch (err: unknown) {
        if (err instanceof Error) {
          error = err
        }
      }
      expect(error).instanceOf(Error)
    })
    test('reads files in location and finds versions for package.json and package-lock.json', async function () {
      let res = ''
      const npmPackageHandler = new NPMPackageHandler(fs, core)
      res = await npmPackageHandler.scan('./')

      // expect(res['packageJsonLock']).to.equal(res['packageJson']) //do we want to include this assertion?
      expect(res.length).to.above(1)
    })
  })

  describe('compare versions', () => {
    test('compare versions failed stubx not called - same', async function () {
      const mock = { ...core }
      const setFailedStubx = sinon.stub(mock, 'setFailed')
      const npmPackageHandler = new NPMPackageHandler(fs, mock)

      await npmPackageHandler.compareVersions('1.1.1', '1.1.1')

      expect(setFailedStubx.calledOnce).to.equal(false)
    })

    test('compare versions failed stubx not called - not the same ', async function () {
      const mock = { ...core }
      const setFailedStubx = sinon.stub(mock, 'setFailed')
      const npmPackageHandler = new NPMPackageHandler(fs, mock)

      await npmPackageHandler.compareVersions('1.1.1', '2.1.1')

      expect(setFailedStubx.calledOnce).to.equal(true)
    })
  })
})
