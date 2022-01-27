/* tslint:disable:no-unused-expression */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import shell from './shell.js'
import { fetchVagrantVersion } from './vagrant_version.js'
chai.use(chaiAsPromised)

describe('fetchVagrantVersion unit tests', () => {
  beforeEach(() => sinon.restore())
  afterEach(() => sinon.restore())
  it('should fetch the trimmed correct version', async () => {
    sinon.mock(shell).expects('exec').once().resolves({ code: 0, stdout: 'vagrant-version\n' })
    expect(await fetchVagrantVersion()).to.be.deep.equal('vagrant-version')
  })
  it('should throw an error when shell.exec vagrant version fails', async () => {
    sinon.mock(shell).expects('exec').once().throws()
    await expect(fetchVagrantVersion()).to.be.rejected
  })
})
