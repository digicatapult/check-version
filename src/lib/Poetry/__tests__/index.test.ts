import sinon from 'sinon'
import fs from 'fs/promises'
import { describe, test } from 'mocha'
import { expect } from 'chai'

import PoetryHandler from '../index.js'

describe('Poetry package manager tests: ', function () {
  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore()
  })

  describe('able to read files', () => {
    test('reads files in location errors if it does not find pyproject.toml', async function () {
      let error: Error | unknown = null
      try {
        const poetryPackageHandler = new PoetryHandler(fs)
        await poetryPackageHandler.scan('some/location/')
      } catch (err: unknown) {
        if (err instanceof Error) {
          error = err
        }
      }
      expect(error).instanceOf(Error)
    })
    test('reads files in location and finds version for pyproject.toml', async function () {
      let res = ''
      const poetryPackageHandler = new PoetryHandler(fs)
      res = await poetryPackageHandler.scan('./src/lib/Poetry/__tests__/__fixtures__/')
      expect(res.length).to.above(1)
    })
  })
})
