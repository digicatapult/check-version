import { describe, test } from 'mocha'
import { expect } from 'chai'
import toml from 'toml'
import sinon, { SinonSpy, SinonStub } from 'sinon'
import fs from 'fs/promises'

import Cargo, { CargoPackage } from '../index.js'

const location: string = './src/lib/Cargo/__tests__/__fixtures__/node'

describe('Cargo class unit test suite', function () {
  let readFileSpy: SinonSpy
  let tomlParseSpy: SinonSpy
  let getPackageDetailsSpy: SinonStub

  let cargo: Cargo
  let result: CargoPackage

  afterEach(() => sinon.restore())

  describe('this.getPackageDetails() method', () => {
    beforeEach(async () => {
      cargo = new Cargo(fs)
      readFileSpy = sinon.spy(fs, 'readFile')
      tomlParseSpy = sinon.spy(toml, 'parse')
      result = await cargo.scan(location)
    })

    afterEach(() => sinon.restore())

    test('reads .toml file', async () => {
      expect(readFileSpy.calledWith(`${location}/Cargo.toml`)).to.equal(true)
    })

    test('parses .toml file to js', async () => {
      expect(tomlParseSpy.calledOnce).to.equal(true)
    })

    test('returns formatted package details', async () => {
      expect(result).to.deep.contain({
        name: 'dscp-node',
        version: '9.0.0',
      })
    })
  })

  describe('this.scan() method', () => {
    beforeEach(async () => {
      cargo = new Cargo(fs)
      getPackageDetailsSpy = sinon.stub(cargo, 'getPackageDetails').resolves({
        name: 'this-is-a-test',
        version: '0',
      })
      result = await cargo.scan(location)
    })

    afterEach(() => getPackageDetailsSpy.restore())

    test('returns formatted cargo package details', () => {
      expect(result).to.deep.contain({
        name: 'this-is-a-test',
        version: '0',
      })
    })
  })
})
