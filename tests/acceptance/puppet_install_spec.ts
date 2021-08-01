import { generatePuppetInstallScript } from '../../src/helpers/puppet_install'
import { expect } from 'chai'

describe('generatePuppetInstallScript test', () => {
  it('generic/centos7 is supported', () => {
    const puppetInstallScript = generatePuppetInstallScript('generic/centos7', 'puppet6')

    expect(puppetInstallScript).to.be.an.instanceOf(Array)
  })

  it('generic/centos8 is supported', () => {
    const puppetInstallScript = generatePuppetInstallScript('generic/centos8', 'puppet6')

    expect(puppetInstallScript).to.be.an.instanceOf(Array)
  })

  it('generic/rhel7 is supported', () => {
    const puppetInstallScript = generatePuppetInstallScript('generic/rhel7', 'puppet6')

    expect(puppetInstallScript).to.be.an.instanceOf(Array)
  })

  it('generic/rhel8 is supported', () => {
    const puppetInstallScript = generatePuppetInstallScript('generic/rhel8', 'puppet6')

    expect(puppetInstallScript).to.be.an.instanceOf(Array)
  })

  it('generic/debian9 is supported', () => {
    const puppetInstallScript = generatePuppetInstallScript('generic/debian9', 'puppet6')

    expect(puppetInstallScript).to.be.an.instanceOf(Array)
  })

  it('generic/debian10 is supported', () => {
    const puppetInstallScript = generatePuppetInstallScript('generic/debian10', 'puppet6')

    expect(puppetInstallScript).to.be.an.instanceOf(Array)
  })

  it('generic/ubuntu1804 is supported', () => {
    const puppetInstallScript = generatePuppetInstallScript('generic/ubuntu1804', 'puppet6')

    expect(puppetInstallScript).to.be.an.instanceOf(Array)
  })

  it('generic/ubuntu2004 is supported', () => {
    const puppetInstallScript = generatePuppetInstallScript('generic/ubuntu2004', 'puppet6')

    expect(puppetInstallScript).to.be.an.instanceOf(Array)
  })

  it('generic/fedora27 is not supported', () => {
    expect(() => generatePuppetInstallScript('generic/fedora27', 'puppet6')).to.throw('No builds for generic/fedora27')
  })
})
