/* tslint:disable:no-unused-expression */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import shell from './shell.js'
import { fetchDockerVersion } from './docker_version.js'
chai.use(chaiAsPromised)

describe('fetchDockerVersion unit tests', () => {
  beforeEach(() => sinon.restore())
  afterEach(() => sinon.restore())
  it('should fetch the trimmed correct version', async () => {
    sinon.mock(shell).expects('exec').once().resolves({ code: 0, stdout: 'docker-version\n' })
    expect(await fetchDockerVersion()).to.be.deep.equal('docker-version')
  })
  it('should throw an error if shell.exec docker version fails', async () => {
    sinon.mock(shell).expects('exec').once().throws()
    await expect(fetchDockerVersion()).to.be.rejected
  })
})
