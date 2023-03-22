import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import shell from './shell.js'
import LOG from './log_utils.js'
const filename = fileURLToPath(import.meta.url)
const localDirname = dirname(filename)

const DOCKER_VERSION_TASK: string = path.join(localDirname, '/../tasks', 'docker_version.sh')

export const fetchDockerVersion = async (): Promise<string> => {
  try {
    const response: string = (await shell.exec(DOCKER_VERSION_TASK)).stdout.trim()
    return response
  } catch (error) {
    LOG(error)
    throw error
  }
}
