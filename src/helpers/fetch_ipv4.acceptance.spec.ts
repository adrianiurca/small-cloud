import shell from '../test/shell.js'
import { fetchIPV4 } from './fetch_ipv4.js'
import { expect } from 'chai'

describe('fetchIPV4 test', () => {
  it('result is an Array', async () => {
    const result = await fetchIPV4()

    expect(result).to.be.an.instanceOf(Array)
  })

  it.skip('fetch correct all IPs - ipv4', async () => {
    const { exec } = await shell()
    const result = (await fetchIPV4()).sort()
    const ipArray = JSON.parse(
      exec(
        '/opt/puppetlabs/bin/facter networking.interfaces --json | jq \'[[."networking.interfaces"[]] | map(select(has("ip")))[] | .ip ]\'',
        { silent: true }
      ).stdout.trim()
    ).sort()

    expect(result).to.deep.equal(ipArray)
  })
})
