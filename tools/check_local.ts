import * as shell from 'shelljs'
import fs from 'fs'
import path from 'path'

interface Platform {
  name: string
  url: string
}

const vagrant_list: string = shell.exec('vagrant box list', { silent: true }).stdout
const platformsPath: string = path.join(__dirname, 'platforms.json')
const platforms: Platform[] = JSON.parse(fs.readFileSync(platformsPath, { encoding: 'utf8' }).toString()).platforms
const isSupportedPlatform: (Platform | boolean) = platforms.find(platform => platform.name == process.argv[2])
const result: string = (isSupportedPlatform) ? ((vagrant_list.includes(isSupportedPlatform.name)) ? 'true' : isSupportedPlatform.url) : 'unsupported'
console.log(result)
