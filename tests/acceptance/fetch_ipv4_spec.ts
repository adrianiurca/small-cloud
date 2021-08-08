import { fetchIPV4 } from '../../src/helpers/fetch_ipv4'
import { expect } from 'chai'
import * as shell from 'shelljs'

describe('fetchIPV4 test', () => {
  it('result is a String', () => {
    const result = fetchIPV4()

    expect(result).to.be.an.instanceOf(Array)
  })

  it('fetch correct all IPs - ipv4', () => {
    const result = fetchIPV4().sort()
    const ipArray = JSON.parse(shell.exec("/opt/puppetlabs/bin/facter networking.interfaces --json | jq '[[.\"networking.interfaces\"[]] | map(select(has(\"ip\")))[] | .ip ]'", { silent: true }).stdout.trim()).sort()

    expect(result).to.deep.equal(ipArray)
  })
})
