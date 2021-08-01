import { provision, teardown, VagrantMachine } from '../../src/helpers/vagrant'
import { expect } from 'chai'
import { NodeSSH } from 'node-ssh'

describe('vagrant helper', () => {
  describe('provision and teardown test - random values', () => {
    let machine: VagrantMachine = null
    it('creates the VM', async() => {
      const details = {
        vm_box: process.env.PLATFORM,
        vm_owner: 'user1'
      }
      machine = await provision(details)

      expect(machine).to.have.property('vm_user').and.to.be.a('string')
      expect(machine).to.have.property('vm_password').and.to.be.a('string')
      expect(machine).to.have.property('vm_ip').and.to.be.a('string')
      expect(machine).to.have.property('vm_box').and.to.be.a('string')
      expect(machine).to.have.property('vm_hostname').and.to.be.a('string')
      expect(machine).to.have.property('vm_path').and.to.be.a('string')
      expect(machine).to.have.property('vm_owner').and.to.be.a('string')
      expect(machine.vm_box).to.equals(process.env.PLATFORM)
      expect(machine.vm_owner).to.equals('user1')
    })

    it('checks the ssh connection', async() => {
      const ssh = new NodeSSH

      await ssh.connect({
        host: machine.vm_hostname,
        username: machine.vm_user,
        password: machine.vm_password
      })

      expect(ssh.isConnected()).to.be.true
      ssh.dispose()
    })

    it('destroy the VM', async() => {
      const status = await teardown(machine)

      expect(status).to.be.a('string')
      expect(status).to.equals('removed!')
    })
  })
})