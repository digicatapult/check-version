import {describe, test} from 'mocha'
import {expect} from 'chai'
import sinon from 'sinon'
import fs from 'fs/promises'
import * as core from '@actions/core'
import {CheckVersion} from '../lib/checkVersion'
import {GetFiles} from '../lib/getFiles'
import {dummyData, expectedArray, Tag, TestData} from './testData'

describe('checkVersion', function () {
  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore()
  })

  test('reads files in location errors if it does not find two files with package in name', async function () {
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

  describe.only('if package manager is Cargo', () => {
    test('scans and parses .toml files', async () => {
        const CV = new CheckVersion(core, fs)
        const res = await CV.checkVersion('./src/lib/Cargo/__tests__/__fixtures__/', '', true, 'cargo', ['node'])

        expect(res).to.be.equal(true)
    })

    test('returns undefined and does not set outputs if .toml file can not be found', async () => {
      const CV = new CheckVersion(core, fs)
      const res = await CV.checkVersion('./', '', true, 'cargo', ['node'])

      expect(res).to.be.undefined
    })
  })

  test('compare versions failed stubx not called - same', async function () {
    const setFailedStubx = sinon.stub(core, 'setFailed')
    const checkVersion = new CheckVersion(core, fs)

    await checkVersion.compareVersions('1.1.1', '1.1.1')

    expect(setFailedStubx.calledOnce).to.equal(false)
  })

  test('compare versions failed stubx not called - not the same ', async function () {
    const setFailedStubx = sinon.stub(core, 'setFailed')

    const checkVersion = new CheckVersion(core, fs)

    await checkVersion.compareVersions('1.1.1', '2.1.1')

    expect(setFailedStubx.calledOnce).to.equal(true)
  })

  test('filter through an array of tags and return sorted ones per semver rules', async function () {
    const checkVersion = new CheckVersion(core, fs)

    const res: Tag[] = await checkVersion.filterTags(dummyData)

    expect(res[res.length - 1].name).to.equal('1.2.0')
    expect(res.length).to.equal(expectedArray.length)
  })

  test('assert comparisons - pass  ', async function () {
    const setFailedStubx = sinon.stub(core, 'setFailed')
    const checkVersion = new CheckVersion(core, fs)

    let res = await checkVersion.assertComparisons('1.1.1', '2.1.1')

    expect(setFailedStubx.calledOnce).to.equal(false)
    expect(res).to.equal(true)
  })

  test('assert comparisons - fail  ', async function () {
    const setFailedStubx = sinon.stub(core, 'setFailed')
    const checkVersion = new CheckVersion(core, fs)

    let res = await checkVersion.assertComparisons('1.1.1', '0.1.1')

    expect(setFailedStubx.calledOnce).to.equal(true)
    expect(res).to.equal(false)
  })

  test('assert same version fails', async function () {
    const setFailedStubx = sinon.stub(core, 'setFailed')
    const checkVersion = new CheckVersion(core, fs)

    let res = await checkVersion.assertComparisons('0.1.1', '0.1.1')

    expect(setFailedStubx.calledOnce).to.equal(true)
    expect(res).to.equal(false)
  })

  test('assert same version passes with failOnSameVersion false', async function () {
    const checkVersion = new CheckVersion(core, fs)

    let res = await checkVersion.assertComparisons('0.1.1', '0.1.1', false)

    expect(res).to.equal(true)
  })

  test('assert v is added to version output', async function () {
    const checkVersion = new CheckVersion(core, fs)
    const setOutputStub = sinon.stub(core, 'setOutput')

    let res = await checkVersion.assertComparisons('0.1.1', '1.1.1')
    expect(setOutputStub.calledWithExactly('version', 'v1.1.1')).to.equal(true)
  })

  test('assert is_prerelease and npm_release_tag output if `-` char present in version', async function () {
    const checkVersion = new CheckVersion(core, fs)
    const setOutputStub = sinon.stub(core, 'setOutput')

    let res = await checkVersion.assertComparisons('0.1.1', '1.1.1-alpha')
    expect(setOutputStub.calledWithExactly('is_prerelease', true)).to.equal(
      true
    )
    expect(setOutputStub.calledWithExactly('npm_release_tag', 'next')).to.equal(
      true
    )
  })

  test('assert is_prerelease and npm_release_tag output if `-` char NOT in version', async function () {
    const checkVersion = new CheckVersion(core, fs)
    const setOutputStub = sinon.stub(core, 'setOutput')

    let res = await checkVersion.assertComparisons('0.1.1', '1.1.1')
    expect(setOutputStub.calledWithExactly('is_prerelease', false)).to.equal(
      true
    )
    expect(
      setOutputStub.calledWithExactly('npm_release_tag', 'latest')
    ).to.equal(true)
  })
})
