import { generatePuppetInstallScript } from './puppet_install.js'
import { Platform } from '../config/platforms'
import { expect } from 'chai'

describe('generatePuppetInstallScript unit tests', () => {
  it('Centos 7 is supported', () => {
    const platform: Platform = {
      box: 'generic/centos7',
      name: 'centos',
      label: 'CentOS 7',
      family: 'redhat',
      majorversion: '7',
      url: 'https://app.vagrantup.com/generic/boxes/centos7/versions/3.2.20/providers/virtualbox.box'
    }
    const puppetInstallScript = generatePuppetInstallScript(platform, 'puppet6')

    expect(puppetInstallScript).to.be.an.instanceOf(Array)
  })

  it('Debian 11 is not supported', () => {
    const platform: Platform = {
      box: 'debian-11-bullseye-v20221102',
      name: 'debian',
      label: 'Debian 11',
      family: 'debian',
      majorversion: '11',
      url: 'https://google.com'
    }
    expect(() => generatePuppetInstallScript(platform, 'puppet6')).to.throw(`No builds for ${platform.label}`)
  })
})
