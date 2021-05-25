import * as shell from 'shelljs'
import path from 'path'

const DOCKER_VERSION_TASK: string = path.join(__dirname, '/../tasks', 'docker_version.sh')

export const fetchDockerVersion = (): string => {
  return shell.exec(DOCKER_VERSION_TASK, { silent: true }).stdout.trim()
}