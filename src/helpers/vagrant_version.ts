import * as shell from 'shelljs'
import path from 'path'

const VAGRANT_VERSION_TASK: string = path.join(__dirname, '/../tasks', 'vagrant_version.sh')

export const fetchVagrantVersion = (): string => {
  return shell.exec(VAGRANT_VERSION_TASK, { silent: true }).stdout.trim()
}