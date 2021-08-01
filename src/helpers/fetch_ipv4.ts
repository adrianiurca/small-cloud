import * as shell from 'shelljs'
import path from 'path'

const FETCH_IPV4_TASK: string = path.join(__dirname, '/../tasks', 'fetch_ipv4.sh')

export const fetchIPV4 = (): string[] => {
  return shell.exec(FETCH_IPV4_TASK, { silent: true }).stdout.trim().split("\n")
}