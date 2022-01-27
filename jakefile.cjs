const copyAssets = require('./tasks/copy_assets.cjs')
const checkLocal = require('./tasks/check_local.cjs')

namespace('tools', () => {
  desc('Copy assets into dist directory')
  task('copy-assets', () => copyAssets())

  desc('Check if a platform is already downloaded')
  task('check-local', () => checkLocal())
})
