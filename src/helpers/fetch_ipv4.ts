import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
const shellImport = import('shelljs')
const filename = fileURLToPath(import.meta.url)
const localDirname = dirname(filename)

const shell = async () => {
  try {
    const response = (await shellImport).default
    return response
  } catch (error) {
    throw error
  }
}

const FETCH_IPV4_TASK: string = path.join(localDirname, '/../tasks', 'fetch_ipv4.sh')

export const fetchIPV4 = async (): Promise<string[]> => {
  try {
    const { exec } = await shell()
    return exec(FETCH_IPV4_TASK, { silent: true }).stdout.trim().split('\n')
  } catch (error) {
    throw error
  }
}
