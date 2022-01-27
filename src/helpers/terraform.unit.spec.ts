/* tslint:disable:no-unused-expression */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import shell from './shell.js'
import fs from 'fs'
import { terraformApply, terraformDestroy, GCPMachineParams, GCPMachine } from './terraform.js'
chai.use(chaiAsPromised)

const machineParams: GCPMachineParams = {
  ownerId: 'some-user-id',
  sshUser: 'root',
  hostname: 'machine-test',
  lifetime: '5h'
}

const machine: GCPMachine = {
  id: 'f8e7d38f-7e43-4d19-99db-d41645a0a6f3',
  ipv4Address: '127.0.0.1',
  sshUser: 'root',
  ed25519Keypath: '/Users/adrian.iurca/Desktop/projects/small-cloud/src/helpers/machine-f8e7d38f-7e43-4d19-99db-d41645a0a6f3/ssh-keys/id_ed25519',
  hostname: 'machine-test',
  lifetime: '5h',
  ownerId: 'some-user-id',
  createdAt: '2023-03-19T01:51:11.277Z',
  machinePath: '/Users/adrian.iurca/Desktop/projects/small-cloud/src/helpers/machine-f8e7d38f-7e43-4d19-99db-d41645a0a6f3'
}

describe('terraform unit tests', () => {
  beforeEach(() => sinon.restore())
  afterEach(() => sinon.restore())
  describe('terraformApply unit testing', () => {
    it('should throw an error when shell.mkdir fails to create machine directory', async () => {
      const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
      mkdirMocks.onFirstCall().throws()
      mkdirMocks.onSecondCall().resolves('private key directory created')

      await expect(terraformApply(machineParams)).to.be.rejected
    })
    it('should thow an error when shell.mkdir fails to create private key directory', async () => {
      const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
      mkdirMocks.onFirstCall().resolves('machine directory created')
      mkdirMocks.onSecondCall().throws()

      await expect(terraformApply(machineParams)).to.be.rejected
    })
    it('should thow an error when fs.writeFileSync fails to create main.tf', async () => {
      const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
      const writeFileSyncMocks = sinon.mock(fs).expects('writeFileSync').exactly(2)
      mkdirMocks.onFirstCall().resolves('machine directory created')
      mkdirMocks.onSecondCall().resolves('private key directory created')
      writeFileSyncMocks.onFirstCall().throws()
      writeFileSyncMocks.onSecondCall().returns('private key file id_ed25519 created')

      await expect(terraformApply(machineParams)).to.be.rejected
    })
    it('should throw an error when fs.writeFileSync fails to create private key file id_ed25519', async () => {
      const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
      const writeFileSyncMocks = sinon.mock(fs).expects('writeFileSync').exactly(2)
      mkdirMocks.onFirstCall().resolves('machine directory created')
      mkdirMocks.onSecondCall().resolves('private keys directory created')
      writeFileSyncMocks.onFirstCall().returns('main.tf created')
      writeFileSyncMocks.onSecondCall().throws()

      await expect(terraformApply(machineParams)).to.be.rejected
    })
    it('should throw an error when shell.exec terraform init command fails', async () => {
      const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
      const writeFileSyncMocks = sinon.mock(fs).expects('writeFileSync').exactly(2)
      const execMocks = sinon.mock(shell).expects('exec').exactly(3)
      mkdirMocks.onFirstCall().resolves('machine directory created')
      mkdirMocks.onSecondCall().resolves('private keys directory created')
      writeFileSyncMocks.onFirstCall().returns('main.tf created')
      writeFileSyncMocks.onSecondCall().returns('private key file id_ed25519 created')
      execMocks.onFirstCall().throws()
      execMocks.onSecondCall().resolves({ code: 0, stdout: 'terraform apply successfully' })
      execMocks.onThirdCall().resolves({ code: 0, stdout: 'json object' })

      await expect(terraformApply(machineParams)).to.be.rejected
    })
    it('should throw an error when shell.exec terraform apply command fails', async () => {
      const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
      const writeFileSyncMocks = sinon.mock(fs).expects('writeFileSync').exactly(2)
      const execMocks = sinon.mock(shell).expects('exec').exactly(3)
      mkdirMocks.onFirstCall().resolves('machine directory created')
      mkdirMocks.onSecondCall().resolves('private keys directory created')
      writeFileSyncMocks.onFirstCall().returns('main.tf created')
      writeFileSyncMocks.onSecondCall().returns('private key file id_ed25519 created')
      execMocks.onFirstCall().resolves({ code: 0, stdout: 'terraform init successfully' })
      execMocks.onSecondCall().throws()
      execMocks.onThirdCall().resolves({ code: 0, stdout: 'json object' })

      await expect(terraformApply(machineParams)).to.be.rejected
    })
    it('should throw an error when shell.exec terraform output command fails', async () => {
      const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
      const writeFileSyncMocks = sinon.mock(fs).expects('writeFileSync').exactly(2)
      const execMocks = sinon.mock(shell).expects('exec').exactly(3)
      mkdirMocks.onFirstCall().resolves('machine directory created')
      mkdirMocks.onSecondCall().resolves('private keys directory created')
      writeFileSyncMocks.onFirstCall().returns('main.tf created')
      writeFileSyncMocks.onSecondCall().returns('private key file id_ed25519 created')
      execMocks.onFirstCall().resolves({ code: 0, stdout: 'terraform init successfully' })
      execMocks.onSecondCall().resolves({ code: 0, stdout: 'terraform apply successfully' })
      execMocks.onThirdCall().throws()

      await expect(terraformApply(machineParams)).to.be.rejected
    })
    it('should throw an error when JSON.parse fails', async () => {
      const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
      const writeFileSyncMocks = sinon.mock(fs).expects('writeFileSync').exactly(2)
      const execMocks = sinon.mock(shell).expects('exec').exactly(3)
      mkdirMocks.onFirstCall().resolves('machine directory created')
      mkdirMocks.onSecondCall().resolves('private keys directory created')
      writeFileSyncMocks.onFirstCall().returns('main.tf created')
      writeFileSyncMocks.onSecondCall().returns('private key file id_ed25519 created')
      execMocks.onFirstCall().resolves({ code: 0, stdout: 'terraform init successfully' })
      execMocks.onSecondCall().resolves({ code: 0, stdout: 'terraform apply successfully' })
      execMocks.onThirdCall().resolves({ code: 0, stdout: 'json object' })
      await expect(terraformApply(machineParams)).to.be.rejected
    })
    it('should throw an error when shell.chmod fails', async () => {
      const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
      const writeFileSyncMocks = sinon.mock(fs).expects('writeFileSync').exactly(2)
      const execMocks = sinon.mock(shell).expects('exec').exactly(3)
      const chmodMock = sinon.mock(shell).expects('chmod').once()
      mkdirMocks.onFirstCall().resolves('machine directory created')
      mkdirMocks.onSecondCall().resolves('private keys directory created')
      writeFileSyncMocks.onFirstCall().returns('main.tf created')
      writeFileSyncMocks.onSecondCall().returns('private key file id_ed25519 created')
      execMocks.onFirstCall().resolves({ code: 0, stdout: 'terraform init successfully' })
      execMocks.onSecondCall().resolves({ code: 0, stdout: 'terraform apply successfully' })
      execMocks.onThirdCall().resolves({ code: 0, stdout: '{ "ip_address": { "value": "127.0.0.1" } }' })
      chmodMock.throws()

      await expect(terraformApply(machineParams)).to.be.rejected
    })
    it('should work', async () => {
        const mkdirMocks = sinon.mock(shell).expects('mkdir').exactly(2)
        const writeFileSyncMocks = sinon.mock(fs).expects('writeFileSync').exactly(2)
        const execMocks = sinon.mock(shell).expects('exec').exactly(3)
        const chmodMock = sinon.mock(shell).expects('chmod').once()
        mkdirMocks.onFirstCall().resolves('machine directory created')
        mkdirMocks.onSecondCall().resolves('private keys directory created')
        writeFileSyncMocks.onFirstCall().returns('main.tf created')
        writeFileSyncMocks.onSecondCall().returns('private key file id_ed25519 created')
        execMocks.onFirstCall().resolves({ code: 0, stdout: 'terraform init successfully' })
        execMocks.onSecondCall().resolves({ code: 0, stdout: 'terraform apply successfully' })
        execMocks.onThirdCall().resolves({ code: 0, stdout: '{ "ip_address": { "value": "127.0.0.1" } }' })
        chmodMock.resolves('chmod 600 successfuly set for private key')

        const response = await terraformApply(machineParams)
        expect(response).to.haveOwnProperty('sshUser', 'root')
        expect(response).to.haveOwnProperty('ownerId', 'some-user-id')
        expect(response).to.haveOwnProperty('lifetime', '5h')
        expect(response).to.haveOwnProperty('hostname', 'machine-test')
        expect(response).to.haveOwnProperty('ipv4Address', '127.0.0.1')
    })
  })
  describe('terraformDestroy unit testing', () => {
    it('should throw an error when shell.exec terraform destroy command fails', async () => {
      const execMock = sinon.mock(shell).expects('exec').once()
      execMock.throws()

      await expect(terraformDestroy(machine)).to.be.rejected
    })
    it('should throw an error when shell.rm machine directory fails', async () => {
      const execMock = sinon.mock(shell).expects('exec').once()
      const rmMock = sinon.mock(shell).expects('rm').once()
      execMock.resolves({ code: 0, stdout: 'terraform apply successfully' })
      rmMock.throws()

      await expect(terraformDestroy(machine)).to.be.rejected
    })
    it('should work', async () => {
      const execMock = sinon.mock(shell).expects('exec').once()
      const rmMock = sinon.mock(shell).expects('rm').once()
      execMock.resolves({ code: 0, stdout: 'terraform apply successfully' })
      rmMock.resolves('machine directory successfully removed')

      const response = await terraformDestroy(machine)
      expect(response).to.be.deep.equal('destroyed!')
    })
  })
})
