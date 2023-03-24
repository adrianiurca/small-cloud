/* tslint:disable:no-unused-expression */
import shell from '../test/shell.js'
import { fetchTerraformVersion } from './terraform_version.js'
import { expect } from 'chai'

describe('fetchTerraformVersion test', () => {
  it('version is a String', async () => {
    const version = await fetchTerraformVersion()

    expect(version).to.be.string
  })

  it.skip('fetch the correct version', async () => {
    const { exec } = await shell()
    const version = await fetchTerraformVersion()
    const systemTerraformVersion = exec('terraform --version', { silent: true }).stdout.trim()
    expect(version).to.be.equal(systemTerraformVersion)
  })
})
