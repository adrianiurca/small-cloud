const shell = require('shelljs')

const copyAssets = () => {
  shell.cp('-R', 'src/views', 'dist/')
  shell.cp('-R', 'src/tasks', 'dist/')
  shell.cp('-R', 'src/templates', 'dist/')
  shell.cp('-R', 'src/db', 'dist/')
  shell.cp('-R', 'src/public', 'dist/')
}

module.exports = copyAssets
