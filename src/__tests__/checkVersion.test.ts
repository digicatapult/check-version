import { describe, test } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import fs from 'fs/promises'
import * as core from '@actions/core'

import { CheckVersion } from '../lib/checkVersion.js'
import { dummyTags, expectedGreedyArray, expectedNonGreedyArray, Tag } from './testData.js'

describe('checkVersion', function () {
  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore()
  })

  describe('if package manager is Cargo', () => {
    test('scans and parses .toml files', async () => {
      const CV = new CheckVersion(core, fs)
      const res = await CV.checkVersion({
        location: './src/lib/Cargo/__tests__/__fixtures__/node',
        ghToken: '',
        failOnSameVersion: true,
        manager: 'cargo',
        tagRegex: '',
      })

      expect(res).to.be.equal(true)
    })

    test('returns undefined and does not set outputs if .toml file can not be found', async () => {
      const CV = new CheckVersion(core, fs)
      const res = await CV.checkVersion({
        location: './',
        ghToken: '',
        failOnSameVersion: false,
        manager: 'cargo',
        tagRegex: '',
      })

      expect(res).to.equal(undefined)
    })
  })

  test('filter through an array of tags and return sorted ones per semver rules - default regex', async function () {
    const checkVersion = new CheckVersion(core, fs)

    const res: Tag[] = await checkVersion.filterTags(dummyTags, `\\d+.\\d+.\\d+`)

    expect(res[res.length - 1].name).to.equal('v1.2.0')
    expect(res.length).to.equal(expectedGreedyArray.length)
  })

  test('filter through an array of tags by user input regex', async function () {
    const checkVersion = new CheckVersion(core, fs)

    const res: Tag[] = await checkVersion.filterTags(dummyTags, `hello`)

    expect(res.length).to.equal(1)
    expect(res[0].name).to.equal('hello')
  })

  test('filter through an array of tags by user input regex - exact v#.#.#', async function () {
    const checkVersion = new CheckVersion(core, fs)

    const res: Tag[] = await checkVersion.filterTags(dummyTags, `^v\\d+\\.\\d+\\.\\d+$`)

    expect(res[res.length - 1].name).to.equal('v1.2.0')
    expect(res.length).to.equal(expectedNonGreedyArray.length)
  })

  test('invalid regex - fails', async function () {
    const mock = { ...core }
    const setFailedStubx = sinon.stub(mock, 'setFailed')
    const checkVersion = new CheckVersion(mock, fs)

    await checkVersion.filterTags(dummyTags, `[`)

    expect(setFailedStubx.calledOnce).to.equal(true)
  })

  test('assert comparisons - pass  ', async function () {
    const mock = { ...core }
    const setFailedStubx = sinon.stub(mock, 'setFailed')
    const checkVersion = new CheckVersion(mock, fs)

    const res = await checkVersion.assertComparisons('1.1.1', '2.1.1', true, 'npm')

    expect(setFailedStubx.calledOnce).to.equal(false)
    expect(res).to.equal(true)
  })

  test('assert comparisons - fail  ', async function () {
    const mock = { ...core }
    const setFailedStubx = sinon.stub(mock, 'setFailed')
    const checkVersion = new CheckVersion(mock, fs)

    const res = await checkVersion.assertComparisons('1.1.1', '0.1.1', true, 'npm')

    expect(setFailedStubx.calledOnce).to.equal(true)
    expect(res).to.equal(false)
  })

  test('assert same version fails', async function () {
    const mock = { ...core }
    const setFailedStubx = sinon.stub(mock, 'setFailed')
    const checkVersion = new CheckVersion(mock, fs)

    const res = await checkVersion.assertComparisons('0.1.1', '0.1.1', true, 'npm')

    expect(setFailedStubx.calledOnce).to.equal(true)
    expect(res).to.equal(false)
  })

  test('assert same version passes with failOnSameVersion false', async function () {
    const checkVersion = new CheckVersion(core, fs)

    const res = await checkVersion.assertComparisons('0.1.1', '0.1.1', false, 'npm')

    expect(res).to.equal(true)
  })

  test('assert v is added to version output', async function () {
    const mock = { ...core }
    const setOutputStub = sinon.stub(mock, 'setOutput')
    const checkVersion = new CheckVersion(mock, fs)

    await checkVersion.assertComparisons('0.1.1', '1.1.1', true, 'npm')
    expect(setOutputStub.calledWithExactly('version', 'v1.1.1')).to.equal(true)
  })

  test('assert is_prerelease and npm_release_tag output if `-` char present in version', async function () {
    const mock = { ...core }
    const setOutputStub = sinon.stub(mock, 'setOutput')
    const checkVersion = new CheckVersion(mock, fs)

    await checkVersion.assertComparisons('0.1.1', '1.1.1-alpha', true, 'npm')
    expect(setOutputStub.calledWithExactly('is_prerelease', true)).to.equal(true)
    expect(setOutputStub.calledWithExactly('npm_release_tag', 'next')).to.equal(true)
  })

  test('assert is_prerelease and npm_release_tag output if `-` char NOT in version', async function () {
    const mock = { ...core }
    const setOutputStub = sinon.stub(mock, 'setOutput')
    const checkVersion = new CheckVersion(mock, fs)

    await checkVersion.assertComparisons('0.1.1', '1.1.1', true, 'npm')
    expect(setOutputStub.calledWithExactly('is_prerelease', false)).to.equal(true)
    expect(setOutputStub.calledWithExactly('npm_release_tag', 'latest')).to.equal(true)
  })
})
