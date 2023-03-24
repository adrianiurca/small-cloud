/* tslint:disable:no-unused-expression */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import shell from './shell.js'
import generateSSHKeypairModule, { SSH_Keypair } from './generate_ssh_keypair.js'
chai.use(chaiAsPromised)

describe('generateSSHKeypair unit tests', () => {
  beforeEach(() => sinon.restore())
  afterEach(() => sinon.restore())
  it('should throw an error when shell.exec fails to run the script', async () => {
    const execMock = sinon.mock(shell).expects('exec').once()
    execMock.onFirstCall().throws()
    await expect(generateSSHKeypairModule.generateSSHKeypair('root')).to.be.rejected
  })
  it('should throw an error when stdout cannot parsed as json', async () => {
    const execMock = sinon.mock(shell).expects('exec').once()
    execMock.onFirstCall().resolves({ stdout: 'wrong json format' })
    await expect(generateSSHKeypairModule.generateSSHKeypair('root')).to.be.rejected
  })
  it('should work', async () => {
    const execMock = sinon.mock(shell).expects('exec').once()
    execMock.onFirstCall().resolves({ stdout: '{"publicKey":"dummy","privateKey":"dummy"}' })
    const response: SSH_Keypair = await generateSSHKeypairModule.generateSSHKeypair('root')
    expect(response).to.haveOwnProperty('publicKey', 'dummy')
    expect(response).to.haveOwnProperty('privateKey', 'dummy') 
  })
})
