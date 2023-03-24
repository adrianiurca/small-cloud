import ejs from 'ejs'
import path, { dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import randomString from 'randomstring'
import * as uuid from 'uuid'
import randomWords from 'random-words'
import LOG from './log_utils.js'
import shell from './shell.js'
import generateSSHKeypairModule from './generate_ssh_keypair.js'
const filename = fileURLToPath(import.meta.url)
const localDirname = dirname(filename)

export interface GCPMachineParams {
  ownerId: string
  sshUser?: string
  hostname?: string
  lifetime?: string
}

export interface GCPMachine {
  id: string
  ipv4Address: string
  sshUser: string
  ed25519Keypath: string
  machinePath: string
  hostname: string
  lifetime: string
  ownerId: string
  facts?: object
  createdAt: string
}

export interface GCPError {
  status_code: number | NodeJS.ErrnoException
  error: Error
}

export const terraformApply = async (machineParams: GCPMachineParams) => {
  try {
    LOG('/src/helpers/terraformApply: entry point')
    const id = uuid.v4()
    const hostname: string =
      typeof machineParams.hostname === 'undefined'
        ? randomWords({ exactly: 2, join: '-' })
        : machineParams.hostname
    const sshUser: string =
      typeof machineParams.sshUser === 'undefined'
        ? randomString.generate()
        : machineParams.sshUser
    const lifetime: string =
      typeof machineParams.lifetime === 'undefined'
        ? '3h'
        : machineParams.lifetime
    const createdAt: string = new Date().toISOString()
    const ownerId: string = machineParams.ownerId
    const { publicKey, privateKey } = await generateSSHKeypairModule.generateSSHKeypair(sshUser)
    const credentials = process.env.KEY_LOCATION
    const terraformTemplatePath: string = path.join(
      localDirname,
      '/../templates',
      'Terraform.ejs'
    )
    const terraformTemplate: string = ejs
      .fileLoader(terraformTemplatePath)
      .toString()
    const terraformParams = { credentials, hostname, publicKey, sshUser }
    const terraform: string = ejs.render(terraformTemplate, terraformParams)
    const machinePath: string = path.join(localDirname, `machine-${id}`)
    const privateKeyLocationPath: string = path.join(
      `${machinePath}`,
      'ssh-keys'
    )
    const privateKeyPath: string = path.join(
      `${privateKeyLocationPath}/`,
      'id_ed25519'
    )
    const machineTerraformPath: string = path.join(
      `${machinePath}/`,
      'main.tf'
    )

    await shell.mkdir(machinePath)
    await shell.mkdir(privateKeyLocationPath)

    const terraformData: Buffer = Buffer.alloc(
      terraform.length,
      terraform,
      'utf8'
    )
    fs.writeFileSync(machineTerraformPath, terraformData)
    const privateKeyData: Buffer = Buffer.alloc(
      privateKey.length,
      privateKey,
      'utf8'
    )
    fs.writeFileSync(privateKeyPath, privateKeyData)

    const { code: _terraformInitCode, stdout: terraformInitSTDOUT } =
      await shell.exec(`terraform -chdir=${machinePath} init -no-color`)
    LOG(`TERRAFORM_INIT-STDOUT: ${terraformInitSTDOUT}`)

    const { code: _terraformApplyCode, stdout: terraformApplySTDOUT } =
      await shell.exec(
        `terraform -chdir=${machinePath} apply -auto-approve -no-color`
      )
    LOG(`TERRAFORM_APPLY-STDOUT: ${terraformApplySTDOUT}`)
    LOG(`TERRAFORM_APPLY[main.tf]: ${terraform}`)

    const { code: _terraformOutputCode, stdout: terraformOutputSTDOUT } =
      await shell.exec(`terraform -chdir=${machinePath} output -json`)
    LOG(`TERRAFORM_OUTPUT-STDOUT ${terraformOutputSTDOUT}`)
    const terraformOutputObject = JSON.parse(terraformOutputSTDOUT)
    const ipv4Address: string = terraformOutputObject.ip_address.value

    const ed25519Keypath: string = privateKeyPath
    await shell.chmod(600, privateKeyPath)

    const machine: GCPMachine = {
      id,
      ipv4Address,
      sshUser,
      ed25519Keypath,
      hostname,
      lifetime,
      ownerId,
      createdAt,
      machinePath,
    }
    return machine
  } catch (error) {
    LOG(error)
    throw new Error(error.message)
  }
}

export const terraformDestroy = async (machine: GCPMachine) => {
  try {
    const { code: _code, stdout } = await shell.exec(
      `terraform -chdir=${machine.machinePath} destroy -auto-approve -no-color`
    )
    LOG(`TERRAFORM_DESTROY-STDOUT: ${stdout}`)
    await shell.rm([machine.machinePath], '-R')
    return 'destroyed!'
  } catch (error) {
    LOG(error)
    throw new Error(error)
  }
}
