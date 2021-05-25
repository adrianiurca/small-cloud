import { fetchVagrantVersion } from '../src/helpers/vagrant_version'
import { expect } from 'chai'
import * as shell from 'shelljs'

describe('fetchVagrantVersion test', () => {
  it('version is a String', () => {
    const version = fetchVagrantVersion()

    expect(version).to.be.string
  })

  it('fetch the correct version', () => {
    const version = fetchVagrantVersion()
    const systemVagrantVersion = shell.exec('vagrant --version', { silent: true }).stdout.trim()

    expect(version).to.be.equal(systemVagrantVersion)
  })
})