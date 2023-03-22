import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import LOG from './log_utils.js'
import shell from './shell.js'
const filename = fileURLToPath(import.meta.url)
const localDirname = dirname(filename)

const TERRAFORM_VERSION_TASK: string = path.join(localDirname, '/../tasks', 'terraform_version.sh')

export const fetchTerraformVersion = async (): Promise<string> => {
  try {
    const response: string = (await shell.exec(TERRAFORM_VERSION_TASK)).stdout.trim()
    return response
  } catch (error) {
    LOG(error)
    throw error
  }
}
