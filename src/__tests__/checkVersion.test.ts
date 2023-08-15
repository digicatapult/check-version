import {describe, test} from 'mocha'
import {expect} from 'chai'
import sinon from 'sinon'
import fs from 'fs/promises'
import * as core from '@actions/core'

import {CheckVersion} from '../checkVersion_new'
import {GetFiles} from '../getFiles'

const pathLocation = 'path/to/thing'

describe('checkVersion', function () {
  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore()
  })
  test('reads files and errors if no package.json', async function () {
    const setFailedStub = sinon.stub(core, 'setFailed')
    const readdirStub = sinon.stub(fs, 'readdir').resolves([]) //mocks out what a function produces
    const checkVersion = new CheckVersion(core, fs)

    await checkVersion.check(pathLocation)

    expect(setFailedStub.calledOnce).to.equal(true)
    expect(setFailedStub.firstCall.args).to.deep.equal(['something'])
  })

  test('reads files in location errors if it does not find two files with package in name', async function () {
    const readdirStub = sinon.stub(fs, 'readdir').resolves([])
    let error: Error | unknown = null
    try {
      const getFiles = new GetFiles(fs)
      await getFiles.getFiles('some/location')
    } catch (err: any) {
      if (err instanceof Error) {
        error = err
      }
    }

    expect(error).instanceOf(Error)
  })

  //how do I do the opposite? - check that it returns an aray of 2 or sth?

  test('compare versions failed stubx not called - same', async function () {
    const setFailedStubx = sinon.stub(core, 'setFailed')
    const readdirStub = sinon.stub(fs, 'readdir').resolves([])
    const checkVersion = new CheckVersion(core, fs)

    await checkVersion.compareVersions('1.1.1', '1.1.1')
    console.log('comparing')

    expect(setFailedStubx.calledOnce).to.equal(false)
  })

  test('compare versions failed stubx not called - not the same ', async function () {
    const setFailedStubx = sinon.stub(core, 'setFailed')
    const readdirStub = sinon.stub(fs, 'readdir').resolves([])
    const checkVersion = new CheckVersion(core, fs)

    await checkVersion.compareVersions('1.1.1', '2.1.1')
    console.log('comparing')

    expect(setFailedStubx.calledOnce).to.equal(true)
  })

  // test('filter through an array of tags and return sorted ones per semver rules', async function () {
  //   const setFailedStubx = sinon.stub(core, 'setFailed')
  //   const readdirStub = sinon.stub(fs, 'readdir').resolves([])
  //   const checkVersion = new CheckVersion(core, fs)

  //   const dummyData = [
  //     {
  //       name: '1.2.0',
  //       commit: {
  //         sha: '',
  //         url: 'dummy.url'
  //       },
  //       zipball_url: 'dummy.url',
  //       tarball_url: 'dummy.url',
  //       node_id: 'dummy.url'
  //     },
  //     {
  //       name: '0.2.0',
  //       commit: {
  //         sha: '',
  //         url: 'dummy.url'
  //       },
  //       zipball_url: 'dummy.url',
  //       tarball_url: 'dummy.url',
  //       node_id: 'dummy.url'
  //     },
  //     {
  //       name: '0.2.1',
  //       commit: {
  //         sha: '',
  //         url: 'dummy.url'
  //       },
  //       zipball_url: 'dummy.url',
  //       tarball_url: 'dummy.url',
  //       node_id: 'dummy.url'
  //     },
  //     {
  //       name: '0.0.0',
  //       commit: {
  //         sha: '',
  //         url: 'dummy.url'
  //       },
  //       zipball_url: 'dummy.url',
  //       tarball_url: 'dummy.url',
  //       node_id: 'dummy.url'
  //     }
  //   ]
  //   const expectedArray = [
  //     {
  //       name: '0.0.0',
  //       commit: {
  //         sha: '',
  //         url: 'dummy.url'
  //       },
  //       zipball_url: 'dummy.url',
  //       tarball_url: 'dummy.url',
  //       node_id: 'dummy.url'
  //     },
  //     {
  //       name: '0.2.0',
  //       commit: {
  //         sha: '',
  //         url: 'dummy.url'
  //       },
  //       zipball_url: 'dummy.url',
  //       tarball_url: 'dummy.url',
  //       node_id: 'dummy.url'
  //     },
  //     {
  //       name: '0.2.1',
  //       commit: {
  //         sha: '',
  //         url: 'dummy.url'
  //       },
  //       zipball_url: 'dummy.url',
  //       tarball_url: 'dummy.url',
  //       node_id: 'dummy.url'
  //     },
  //     {
  //       name: '1.2.0',
  //       commit: {
  //         sha: '',
  //         url: 'dummy.url'
  //       },
  //       zipball_url: 'dummy.url',
  //       tarball_url: 'dummy.url',
  //       node_id: 'dummy.url'
  //     }
  //   ]

  //   const res = await checkVersion.filterTags(dummyData)
  //   console.log('comparing')

  //   expect(res).to.equal(expectedArray)
  // })
})
