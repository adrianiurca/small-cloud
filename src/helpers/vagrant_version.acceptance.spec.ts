/* tslint:disable:no-unused-expression */
import shell from '../test/shell.js'
import { fetchVagrantVersion } from './vagrant_version.js'
import { expect } from 'chai'

describe('fetchVagrantVersion test', () => {
  it('version is a String', async () => {
    const version = await fetchVagrantVersion()

    expect(version).to.be.string
  })

  it('fetch the correct version', async () => {
    const { exec } = await shell()
    const version = await fetchVagrantVersion()
    const systemVagrantVersion = exec('vagrant --version', { silent: true }).stdout.trim()

    expect(version).to.be.equal(systemVagrantVersion)
  })
})
