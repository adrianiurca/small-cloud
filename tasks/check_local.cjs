const platforms = require('./platforms.json')
const shell = require('shelljs')

const checkLocal = () => {
  const param = process.argv.filter(arg => arg.startsWith('platform='))[0].split('=')[1]
  const vagrantList = shell.exec('vagrant box list', { silent: true }).stdout
  const isSupportedPlatform = platforms.find(platform => platform.name === param)
  const result = (isSupportedPlatform) ? ((vagrantList.includes(param)) ? 'true' : isSupportedPlatform.url) : 'unsupported'
  console.log(result)
}

module.exports = checkLocal
