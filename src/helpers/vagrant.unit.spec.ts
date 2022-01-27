/* tslint:disable:no-unused-expression */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import shell from './shell.js'
import { provision, teardown, VagrantDetails, VagrantMachine } from './vagrant.js'
chai.use(chaiAsPromised)

const details: VagrantDetails = {
  sshUser: 'root',
  password: 'root',
  box: 'generic/centos7',
  owner: 'me'
}

describe('vagrant provision unit testing', () => {
  it('should throw an error when shell.mkdir fails to create machine directory', async () => {
    const mkdirMock = sinon.mock(shell).expects('mkdir').once()
    mkdirMock.onFirstCall().throws()
    await expect(provision(details)).to.be.rejected
  })
})
