import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import LOG from './log_utils.js'
import shell from './shell.js'
const filename = fileURLToPath(import.meta.url)
const localDirname = dirname(filename)

const GENERATE_SSH_KEYPAIR_TASK: string = path.join(localDirname, '/../tasks', 'generate_ssh_keypair.sh')

export type SSH_Keypair = {
  publicKey: string
  privateKey: string
}

const generateSSHKeypair = async (sshUser: string): Promise<SSH_Keypair> => {
  try {
    const response: string = (await shell.exec(`${GENERATE_SSH_KEYPAIR_TASK} ssh-user=${sshUser}`)).stdout.trim()
    const responseJSON: SSH_Keypair = JSON.parse(response)
    return responseJSON
  } catch (error) {
    LOG(error)
    throw error
  }
}

export default { generateSSHKeypair }
