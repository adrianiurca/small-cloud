import path, { dirname } from 'path'
import ejs from 'ejs'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { allVms } from './db_utils.js'
import randomString from 'randomstring'
import { generatePuppetInstallScript } from './puppet_install.js'
import { Platform, platformList } from '../config/platforms.js'
import { fetchIPV4 } from './fetch_ipv4.js'
import LOG from './log_utils.js'
import shell from './shell.js'
import randomWords from 'random-words'
import { fileURLToPath } from 'url'
const filename = fileURLToPath(import.meta.url)
const localDirname = dirname(filename)

export interface VagrantMachine {
  id: string
  sshUser: string
  password: string
  ipv4Address: string
  box: string
  hostname: string
  path: string
  details?: VagrantFacts
  lifetime: string
  owner: string
  createdAt: string
}

export interface VagrantDetails {
  sshUser?: string
  password?: string
  box: string
  lifetime?: string
  owner: string
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
    architecture: string;
    family: string;
    hardware: string;
    name: string;
    release: string;
  }
  processors: {
    count: number;
    isa: string;
    models: string[];
    physicalcount: number;
  }
  memory: {
    swap: string;
    system: string;
  }
  kernel: string
  kernelrelease: string
  is_virtual: boolean
  timezone: string
  virtual: string
  disks: {
    sda: {
      model: string;
      size: string;
    };
  }
  filesystems: string
}

const fetchVmFacts = (output: string): VagrantFacts => {
  const osArchitecture: string = output.match(
    /###facter_os_architecture\s(.*)\sfacter_os_architecture###/
  )[1]
  const osFamily: string = output.match(
    /###facter_os_family\s(.*)\sfacter_os_family###/
  )[1]
  const osHardware: string = output.match(
    /###facter_os_hardware\s(.*)\sfacter_os_hardware###/
  )[1]
  const osName: string = output.match(
    /###facter_os_name\s(.*)\sfacter_os_name###/
  )[1]
  const osRelease: string = output.match(
    /###facter_os_release\s(.*)\sfacter_os_release###/
  )[1]
  const memorySwap: string = output.match(
    /###facter_memory_swap\s(.*)\sfacter_memory_swap###/
  )[1]
  const memorySystem: string = output.match(
    /###facter_memory_system\s(.*)\sfacter_memory_system###/
  )[1]
  const processorsCount: number = parseInt(
    output.match(
      /###facter_processors_count\s(.*)\sfacter_processors_count###/
    )[1],
    10
  )
  const processorsModels = []
  for (let index = 0; index < processorsCount; index++) {
    const regex: RegExp = new RegExp(
      `###facter_processors_models_${index}#(.*)#facter_processors_models_${index}###`
    )
    processorsModels.push(output.match(regex)[1])
  }
  const processorsIsa: string = output.match(
    /###facter_processors_isa\s(.*)\sfacter_processors_isa###/
  )[1]
  const processorsPhysicalcount: number = parseInt(
    output.match(
      /###facter_processors_physicalcount\s(.*)\sfacter_processors_physicalcount###/
    )[1],
    10
  )
  const kernel: string = output.match(
    /###facter_kernel\s(.*)\sfacter_kernel###/
  )[1]
  const kernelRelease: string = output.match(
    /###facter_kernelrelease\s(.*)\sfacter_kernelrelease###/
  )[1]
  const timezone: string = output.match(
    /###facter_timezone\s(.*)\sfacter_timezone###/
  )[1]
  const virtual: string = output.match(
    /###facter_virtual\s(.*)\sfacter_virtual###/
  )[1]
  const isVirtual: boolean =
    output.match(/###facter_is_virtual\s(.*)\sfacter_is_virtual###/)[1] ===
    'true'
  const disksModel: string = output.match(
    /###facter_disks_sda_model\s(.*)\sfacter_disks_sda_model###/
  )[1]
  const disksSize: string = output.match(
    /###facter_disks_sda_size\s(.*)\sfacter_disks_sda_size###/
  )[1]
  const fileSystems: string = output.match(
    /###facter_filesystems\s(.*)\sfacter_filesystems###/
  )[1]

  const facts: VagrantFacts = {
    os: {
      architecture: osArchitecture,
      family: osFamily,
      hardware: osHardware,
      name: osName,
      release: osRelease,
    },
    processors: {
      count: processorsCount,
      isa: processorsIsa,
      models: processorsModels,
      physicalcount: processorsPhysicalcount,
    },
    memory: {
      swap: memorySwap,
      system: memorySystem,
    },
    kernel,
    kernelrelease: kernelRelease,
    is_virtual: isVirtual,
    virtual,
    timezone,
    disks: {
      sda: {
        model: disksModel,
        size: disksSize,
      },
    },
    filesystems: fileSystems,
  }
  return facts
}

export const provision = async (
  machine: VagrantDetails
): Promise<VagrantMachine> => {
  try {
    // build path for vagranfile ejs template
    const vagrantfileTemplatePath: string = path.join(
      localDirname,
      '/../templates',
      'Vagrantfile.ejs'
    )

    // load template
    const vagrantfileTemplate: string = ejs
      .fileLoader(vagrantfileTemplatePath)
      .toString()

    // generate hostname
    let hostname: string = `${randomWords({ exactly: 2, join: '-' })}.vm`
    while (
      allVms()
        .map((vm) => vm.hostname)
        .includes(hostname)
    ) {
      hostname = `${randomWords({ exactly: 2, join: '-' })}.vm`
    }

    machine.sshUser =
      typeof machine.sshUser === 'undefined'
        ? randomString.generate()
        : machine.sshUser
    machine.password =
      typeof machine.password === 'undefined'
        ? randomString.generate()
        : machine.password
    machine.lifetime =
      typeof machine.lifetime === 'undefined' ? '3h' : machine.lifetime

    const platformListProviderSpecific: Platform[] = platformList.virtualbox
    const vmPlatform: Platform = platformListProviderSpecific.filter(
      (x) => x.box === machine.box
    )[0]
    const puppetInstallScript: string[] = generatePuppetInstallScript(
      vmPlatform,
      'puppet6'
    )
    const vagrantfileParams = {
      ...machine,
      hostname,
      puppetInstallScript,
      osfamily: vmPlatform.family,
    }

    const vagrantfileParamsProviderSpecific = vagrantfileParams

    // fill template with values
    const vagrantfile: string = ejs.render(vagrantfileTemplate, {
      ...vagrantfileParamsProviderSpecific,
    })

    // generate path for Vagrantfile(the VM's name)
    const machinePath: string = path.join(localDirname, `machine-${uuidv4()}`)

    // create directory... for example dist/machine-e85a61bf-84eb-4aa1-9436-9244c16a40c4
    const x = await shell.mkdir(machinePath)

    // build path for Vagrantfile
    const machineVagrantfilePath: string = path.join(
      `${machinePath}/`,
      'Vagrantfile'
    )

    // buffer data
    const vagrantfileData: Buffer = Buffer.alloc(
      vagrantfile.length,
      vagrantfile,
      'utf8'
    )

    // build Vagrantfile
    fs.writeFileSync(machineVagrantfilePath, vagrantfileData)

    // build VM
    const { stdout: vagrantUpStdout } = await shell.exec(
      `cd ${machinePath} && vagrant up`
    )
    LOG(`VAGRANTFILE: ${vagrantfile}`)
    LOG(`STDOUT: ${vagrantUpStdout}`)
    const vmIPs: string[] = []
    const vmIPsLength: number = parseInt(
      vagrantUpStdout.match(/###facter_ip_count\s(.*)\sfacter_ip_count###/)[1],
      10
    )
    for (let index = 0; index < vmIPsLength; index++) {
      const regex: RegExp = new RegExp(
        `###facter_ip_${index}#(.*)#facter_ip_${index}###`
      )
      vmIPs.push(vagrantUpStdout.match(regex)[1])
    }
    const hostIPs: string[] = await fetchIPV4()
    let vmIp: string = vmIPs
      .filter(
        (vmIP) =>
          hostIPs
            .map((ip) => `${ip.split('.')[0]}.${ip.split('.')[1]}`)
            .filter((ip) => vmIP.startsWith(ip)).length > 0
      )
      .filter((ip) => ip.split('.')[0] !== '127')[0]
    if (typeof vmIp === 'undefined') {
      vmIp = vmIPs[0]
    }
    LOG(`HOSTIPS: ${hostIPs}`)
    LOG(`VMIPS: ${vmIPs}`)
    LOG(`VM_IP: ${vmIp}`)
    // const vmDetails: VagrantFacts = fetchVmFacts(vagrantUpStdout)
    const { stdout: puppetApplyStdout } = await shell.exec(
      `/opt/puppetlabs/bin/puppet apply -e "host {'${hostname}': ensure => present, name => '${hostname}', ip => '${vmIp}'}"`
    )
    LOG(puppetApplyStdout)
    return {
      id: uuidv4(),
      sshUser: machine.sshUser,
      password: machine.password,
      box: machine.box,
      lifetime: machine.lifetime,
      owner: machine.owner,
      ipv4Address: vmIp,
      hostname,
      path: machinePath,
      // vm_details: vmDetails,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    LOG(error)
    throw new Error(error)
  }
}

export const teardown = async (machine: VagrantMachine): Promise<string> => {
  try {
    // run vagrant destroy
    const { stdout: vagrantDestroyStdout } = await shell.exec(
      `cd ${machine.path} && vagrant destroy -f`
    )
    LOG(vagrantDestroyStdout)
    await shell.rm([machine.path], '-rf')
    const { stdout: puppetApplyStdout } = await shell.exec(
      `/opt/puppetlabs/bin/puppet apply -e "host {'${machine.hostname}': ensure => absent, name => '${machine.hostname}', ip => '${machine.ipv4Address}'}"`
    )
    LOG(puppetApplyStdout)
    return 'removed!'
  } catch (error) {
    LOG(error)
    throw new Error(error)
  }
}
