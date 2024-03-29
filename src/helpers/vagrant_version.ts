import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import LOG from './log_utils.js'
import shell from './shell.js'
const filename = fileURLToPath(import.meta.url)
const localDirname = dirname(filename)

const VAGRANT_VERSION_TASK: string = path.join(localDirname, '/../tasks', 'vagrant_version.sh')

export const fetchVagrantVersion = async (): Promise<string> => {
  try {
    const response: string = (await shell.exec(VAGRANT_VERSION_TASK)).stdout.trim()
    return response
  } catch (error) {
    LOG(error)
    throw error
  }
}
