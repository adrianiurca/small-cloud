import * as shell from 'shelljs'
import path from 'path'
import ejs from 'ejs'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import randomWords = require('random-words')
import { allVms, lastIndex } from './db_utils'
import randomString = require('randomstring')
import log from './log_utils'

export interface VagrantMachine {
  vm_id: number
  vm_user: string
  vm_password: string
  vm_ip: string
  vm_box: string
  vm_hostname: string
  vm_path: string
  vm_details: VagrantFacts
  vm_lifetime: string
  vm_owner: string
}

export interface VagrantDetails {
  vm_user?: string
  vm_password?: string
  vm_box: string
  vm_lifetime?: string
  vm_owner: string
}

export interface VagrantError {
  status_code: number
  error: Error
}

export interface MemoryDetails {
  available: string
}

export interface VagrantFacts {
  os: {
    architecture: string
    family: string
    hardware: string
    name: string
    release: string
  }
  processors: {
    count: number
    isa: string
    models: string[]
    physicalcount: number
  }
  memory: {
    swap: string
    system: string
  }
  kernel: string
  kernelrelease: string
  is_virtual: boolean
  timezone: string
  virtual: string
  disks: {
    sda: {
      model: string
      size: string
    }
  }
  filesystems: string
}

const fetchVmFacts = (output: string): VagrantFacts => {
  const osArchitecture: string = output.match(/###facter_os_architecture\s(.*)\sfacter_os_architecture###/)[1]
  const osFamily: string = output.match(/###facter_os_family\s(.*)\sfacter_os_family###/)[1]
  const osHardware: string = output.match(/###facter_os_hardware\s(.*)\sfacter_os_hardware###/)[1]
  const osName: string = output.match(/###facter_os_name\s(.*)\sfacter_os_name###/)[1]
  const osRelease: string = output.match(/###facter_os_release\s(.*)\sfacter_os_release###/)[1]
  const memorySwap: string = output.match(/###facter_memory_swap\s(.*)\sfacter_memory_swap###/)[1]
  const memorySystem: string = output.match(/###facter_memory_system\s(.*)\sfacter_memory_system###/)[1]
  const processorsCount: number = parseInt(output.match(/###facter_processors_count\s(.*)\sfacter_processors_count###/)[1], 10)
  const processorsModels = []
  for(let index = 0; index < processorsCount; index++) {
    const regex: RegExp = new RegExp(`###facter_processors_models_${index}#(.*)#facter_processors_models_${index}###`)
    processorsModels.push(output.match(regex)[1])
  }
  const processorsIsa: string = output.match(/###facter_processors_isa\s(.*)\sfacter_processors_isa###/)[1]
  const processorsPhysicalcount: number = parseInt(output.match(/###facter_processors_physicalcount\s(.*)\sfacter_processors_physicalcount###/)[1], 10)
  const kernel: string = output.match(/###facter_kernel\s(.*)\sfacter_kernel###/)[1]
  const kernelRelease: string = output.match(/###facter_kernelrelease\s(.*)\sfacter_kernelrelease###/)[1]
  const timezone: string = output.match(/###facter_timezone\s(.*)\sfacter_timezone###/)[1]
  const virtual: string = output.match(/###facter_virtual\s(.*)\sfacter_virtual###/)[1]
  const isVirtual: boolean = (output.match(/###facter_is_virtual\s(.*)\sfacter_is_virtual###/)[1] === 'true')
  const disksModel: string = output.match(/###facter_disks_sda_model\s(.*)\sfacter_disks_sda_model###/)[1]
  const disksSize: string = output.match(/###facter_disks_sda_size\s(.*)\sfacter_disks_sda_size###/)[1]
  const fileSystems: string = output.match(/###facter_filesystems\s(.*)\sfacter_filesystems###/)[1]

  const facts: VagrantFacts = {
    os: {
      architecture: osArchitecture,
      family: osFamily,
      hardware: osHardware,
      name: osName,
      release: osRelease
    },
    processors: {
      count: processorsCount,
      isa: processorsIsa,
      models: processorsModels,
      physicalcount: processorsPhysicalcount
    },
    memory: {
      swap: memorySwap,
      system: memorySystem
    },
    kernel,
    kernelrelease: kernelRelease,
    is_virtual: isVirtual,
    virtual,
    timezone,
    disks: {
      sda: {
        model: disksModel,
        size: disksSize
      }
    },
    filesystems: fileSystems
  }
  return facts
}

export const provision = (machine: VagrantDetails) => {
  return new Promise<VagrantMachine>((resolve: (value: VagrantMachine) => void, reject: (reason: VagrantError) => void) => {
    // build path for vagranfile ejs template
    const vagrantfileTemplatePath: string = path.join(__dirname, '/../templates', 'Vagrantfile.ejs')

    // load template
    const vagrantfileTemplate: string = ejs.fileLoader(vagrantfileTemplatePath).toString()

    // generate hostname
    let vmHostName: string = `${randomWords({ exactly: 2, join: '-' })}.vm`
    while(allVms().map(vm => vm.vm_hostname).includes(vmHostName)) {
      vmHostName = `${randomWords({ exactly: 2, join: '-' })}.vm`
    }

    machine.vm_user = (typeof(machine.vm_user) === 'undefined') ? randomString.generate() : machine.vm_user
    machine.vm_password = (typeof(machine.vm_password) === 'undefined') ? randomString.generate() : machine.vm_password
    machine.vm_lifetime = (typeof(machine.vm_lifetime) === 'undefined') ? '3h' : machine.vm_lifetime

    // fill template with values
    const vagrantfile: string = ejs.render(vagrantfileTemplate, {
      vm_user: machine.vm_user,
      vm_password: machine.vm_password,
      vm_box: machine.vm_box,
      vm_hostname: vmHostName
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
    shell.exec(`cd ${machinePath} && vagrant up`, { async: true, silent: true }, (vagrantUpCode, vagrantUpStdout, vagrantUpStderr) => {
      if(vagrantUpCode !== 0) {
        log(vagrantUpStdout)
        return reject({ status_code: vagrantUpCode, error: new Error(vagrantUpStderr) })
      } else {
        const vmIp: string = vagrantUpStdout.match(/###FACTER\s(.*)\sFACTER###/)[1]
        log(`STDOUT: ${vagrantUpStdout}`)
        const vmDetails: VagrantFacts = fetchVmFacts(vagrantUpStdout)
        shell.exec(
          `/opt/puppetlabs/bin/puppet apply -e "host {'${vmHostName}': ensure => present, name => '${vmHostName}', ip => '${vmIp}'}"`,
          { async: true, silent: true },
          (puppetApplyCode, puppetApplyStdout, puppetApplyStderr) => {
            if(puppetApplyCode !== 0) {
              log(puppetApplyStdout)
              return reject({ status_code: puppetApplyCode, error: new Error(puppetApplyStderr) })
            } else {
              return resolve({
                vm_id: lastIndex() + 1,
                vm_user: machine.vm_user,
                vm_password: machine.vm_password,
                vm_ip: vmIp,
                vm_box: machine.vm_box,
                vm_hostname: vmHostName,
                vm_path: machinePath,
                vm_details: vmDetails,
                vm_lifetime: machine.vm_lifetime,
                vm_owner: machine.vm_owner
              })
            }
          }
        )
      }
    })
  })
}

export const teardown = (machine: VagrantMachine) => {
  return new Promise<string>((resolve: (value: string) => void, reject: (reason: VagrantError) => void) => {
    // run vagrant destroy
    shell.exec(`cd ${machine.vm_path} && vagrant destroy -f`, { async: true, silent: true }, (vagrantDestroyCode, _vagrantDestroyStdout, vagrantDestroyStderr) => {
      if(vagrantDestroyCode !== 0) return reject({ status_code: vagrantDestroyCode, error: new Error(vagrantDestroyStderr) })
      shell.rm('-rf', machine.vm_path)
      shell.exec(
        `/opt/puppetlabs/bin/puppet apply -e "host {'${machine.vm_hostname}': ensure => absent, name => '${machine.vm_hostname}', ip => '${machine.vm_ip}'}"`,
        { async: true, silent: true },
        (puppetApplyCode, _puppetApplyStdout, puppetApplyStderr) => {
          if(puppetApplyCode !== 0) return reject({ status_code: puppetApplyCode, error: new Error(puppetApplyStderr) })
          return resolve('removed!')
        }
      )
    })
  })
}
