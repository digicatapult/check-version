import {describe, test} from 'mocha'
import {expect} from 'chai'
import sinon from 'sinon'

import fs from 'fs/promises'
import * as core from '@actions/core'

import {CheckVersion} from '../checkVersion_new'
import {GetFiles} from '../getFiles'

const pathLocation = 'path/to/thing'

describe('checkVersion', function () {})

describe('readfiles', function () {
  // afterEach(() => {
  //   // Restore the default sandbox here
  //   sinon.restore()
  // })
  test('reads files in location errors if it does not find two files with package in name', async function () {
    const readdirStub = sinon.stub(fs, 'readdir').resolves([])
    let error: Error | unknown = null
    try {
      const getFiles = new GetFiles(fs)
      await getFiles.getFiles('some/location')
    } catch (err: unknown) {
      error = err
    }

    expect(error).instanceOf(Error)
  })

  test('reads files and errors if no package.json', async function () {
    const setFailedStub = sinon.stub(core, 'setFailed')
    const readdirStub = sinon.stub(fs, 'readdir').resolves([]) //mocks out what a function produces
    const checkVersion = new CheckVersion(core, fs)

    await checkVersion.check(pathLocation)

    expect(setFailedStub.calledOnce).to.equal(true)
    expect(setFailedStub.firstCall.args).to.deep.equal(['something'])
  })
  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore()
  })

  //sandboxes sinon or can just do sinon.restore
})
