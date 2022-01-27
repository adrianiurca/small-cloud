/* tslint:disable:no-unused-expression */
import shell from '../test/shell.js'
import { fetchDockerVersion } from './docker_version.js'
import { expect } from 'chai'

describe('fetchDockerVersion test', () => {
  it('version is a String', async () => {
    const version = await fetchDockerVersion()

    expect(version).to.be.string
  })

  it('fetch the correct version', async () => {
    const { exec } = await shell()
    const version = await fetchDockerVersion()
    const systemDockerVersion = exec('docker --version', { silent: true }).stdout.trim()

    expect(version).to.be.equal(systemDockerVersion)
  })
})
