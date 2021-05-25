import * as shell from 'shelljs'
import path from 'path'
import ejs from 'ejs'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import randomWords = require('random-words')
import { allVms } from './db_utils'
import randomString = require('randomstring')

export interface VagrantMachine {
  vm_user: string
  vm_password: string
  vm_ip: string
  vm_box: string
  vm_hostname: string
  vm_path: string
  vm_owner: string
}

export interface VagrantDetails {
  vm_user?: string
  vm_password?: string
  vm_box: string
  vm_owner: string
}

export interface VagrantError {
  status_code: number
  error: Error
}

export const provision = (machine: VagrantDetails) => {
  return new Promise<VagrantMachine>((resolve: (value: VagrantMachine) => void, reject: (reason: VagrantError) => void) => {
    // build path for vagranfile ejs template
    const vagrantfileTemplatePath: string = path.join(__dirname, '/../templates', 'Vagrantfile.ejs')

    // load template
    const vagrantfileTemplate: string = ejs.fileLoader(vagrantfileTemplatePath).toString()

    // generate hostname
    let vm_hostname: string = `${randomWords({ exactly: 2, join: '-' })}.vm`
    while(allVms().map(vm => vm.vm_hostname).includes(vm_hostname)) {
      vm_hostname = `${randomWords({ exactly: 2, join: '-' })}.vm`
    }

    machine.vm_user = (typeof(machine.vm_user) === 'undefined') ? randomString.generate() : machine.vm_user
    machine.vm_password = (typeof(machine.vm_password) === 'undefined') ? randomString.generate() : machine.vm_password

    // fill template with values
    const vagrantfile: string = ejs.render(vagrantfileTemplate, { 
      vm_user: machine.vm_user,
      vm_password: machine.vm_password,
      vm_box: machine.vm_box,
      vm_hostname: vm_hostname
    })

    // generate path for Vagrantfile(the VM's name)
    const machinePath: string = path.join(__dirname, `machine-${uuidv4()}`)

    // create directory... for example dist/machine-e85a61bf-84eb-4aa1-9436-9244c16a40c4
    shell.mkdir(machinePath)

    // build path for Vagrantfile
    const machineVagrantfilePath: string = path.join(`${machinePath}/`, 'Vagrantfile')

    // build Vagrantfile
    fs.writeFile(machineVagrantfilePath, vagrantfile, (err) => {
      if(err) return reject({ status_code: 1, error: err })
    })

    // build VM
    shell.exec(`cd ${machinePath} && vagrant up`, { async: true, silent: true }, (code, stdout, stderr) => {
      if(code != 0) {
        return reject({ status_code: code, error: new Error(stderr) })
      } else {
        const vm_ip: string = stdout.match(/###FACTER\s(.*)\sFACTER###/)[1]
        shell.exec(
          `/opt/puppetlabs/bin/puppet apply -e "host {'${vm_hostname}': ensure => present, name => '${vm_hostname}', ip => '${vm_ip}'}"`,
          { async: true, silent: true },
          (code, _stdout, stderr) => {
            if(code != 0) return reject({ status_code: code, error: new Error(stderr) })
            return resolve({
              vm_user: machine.vm_user,
              vm_password: machine.vm_password,
              vm_ip: vm_ip,
              vm_box: machine.vm_box,
              vm_hostname: vm_hostname,
              vm_path: machinePath,
              vm_owner: machine.vm_owner
            })
          }
        )
      }
    })
  })
}

export const teardown = (machine: VagrantMachine) => {
  return new Promise<string>((resolve: (value: string) => void, reject: (reason: VagrantError) => void) => {
    // run vagrant destroy
    shell.exec(`cd ${machine.vm_path} && vagrant destroy -f`, { async: true, silent: true }, (code, _stdout, stderr) => {
      if(code != 0) return reject({ status_code: code, error: new Error(stderr) })
      shell.rm('-rf', machine.vm_path)
      shell.exec(
        `/opt/puppetlabs/bin/puppet apply -e "host {'${machine.vm_hostname}': ensure => absent, name => '${machine.vm_hostname}', ip => '${machine.vm_ip}'}"`,
        { async: true, silent: true },
        (code, _stdout, stderr) => {
          if(code != 0) return reject({ status_code: code, error: new Error(stderr) })
          return resolve('removed!')
        }
      )
    })
  })
}
