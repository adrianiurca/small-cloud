/* tslint:disable:no-unused-expression */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import shell from './shell.js'
import { fetchTerraformVersion } from './terraform_version.js'
chai.use(chaiAsPromised)

describe('fetchTerraformVersion unit tests', () => {
  beforeEach(() => sinon.restore())
  afterEach(() => sinon.restore())
  it('should fetch the trimmed correct version', async () => {
    sinon.mock(shell).expects('exec').once().resolves({ code: 0, stdout: 'terraform-version\n' })
    expect(await fetchTerraformVersion()).to.be.deep.equal('terraform-version')
  })
  it('should throw an error when shell.exec terraform version fails', async () => {
    sinon.mock(shell).expects('exec').once().throws()
    await expect(fetchTerraformVersion()).to.be.rejected
  })
})
