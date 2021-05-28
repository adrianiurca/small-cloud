import { fetchDockerVersion } from '../src/helpers/docker_version'
import { expect } from 'chai'
import * as shell from 'shelljs'

describe('fetchDockerVersion test', () => {
  it('version is a String', () => {
    const version = fetchDockerVersion()

    expect(version).to.be.string
  })

  it('fetch the correct version', () => {
    const version = fetchDockerVersion()
    const systemDockerVersion = shell.exec('docker --version', { silent: true }).stdout.trim()

    expect(version).to.be.equal(systemDockerVersion)
  })
})
