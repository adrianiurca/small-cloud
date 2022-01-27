/* tslint:disable:no-unused-expression */
import { provision, teardown, VagrantDetails, VagrantMachine } from './vagrant.js'
import { expect } from 'chai'
import { NodeSSH } from 'node-ssh'
import { fail } from 'assert'

describe('vagrant helper', () => {
  describe.skip('provision and teardown test - random values', () => {
    let machine: VagrantMachine | null = null
    it('creates the VM', async() => {
      const details: VagrantDetails = {
        box: process.env.PLATFORM || '',
        owner: 'user1'
      }
      machine = await provision(details)

      expect(machine).to.have.property('vm_user').and.to.be.a('string')
      expect(machine).to.have.property('vm_password').and.to.be.a('string')
      expect(machine).to.have.property('vm_ip').and.to.be.a('string')
      expect(machine).to.have.property('vm_box').and.to.be.a('string')
      expect(machine).to.have.property('vm_hostname').and.to.be.a('string')
      expect(machine).to.have.property('vm_path').and.to.be.a('string')
      expect(machine).to.have.property('vm_owner').and.to.be.a('string')
      expect(machine.box).to.equals(process.env.PLATFORM)
      expect(machine.owner).to.equals('user1')
    })

    it('checks the ssh connection', async() => {
      const ssh = new NodeSSH()
      if(machine) {
        await ssh.connect({
          host: machine.hostname,
          username: machine.sshUser,
          password: machine.password
        })

        expect(ssh.isConnected()).to.be.true
        ssh.dispose()
      } else {
        fail('TEST ENVIRONMENT: Machine was not created!')
      }
    })

    it('destroy the VM', async() => {
      if(machine) {
        const status = await teardown(machine)

        expect(status).to.be.a('string')
        expect(status).to.equals('removed!')
      } else {
        fail('TEST ENVIRONMENT: Machine was not created!')
      }
    })
  })
})
