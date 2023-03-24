import { Platform } from '../config/platforms'

const fetchCodename = (platform: Platform, collection: string) => {
  let codename = 'unsupported'
  switch (platform.majorversion) {
    case '8':
      if (collection === 'puppet6') {
        codename = 'jessie'
      }
      break
    case '9':
      codename = 'stretch'
      break
    case '10':
      codename = 'buster'
      break
    case '14.04':
    case '1404':
      if (collection === 'puppet6') {
        codename = 'trusty'
      }
      break
    case '1604':
    case '16.04':
      codename = 'xenial'
      break
    case '1804':
    case '18.04':
      codename = 'bionic'
      break
    case '2004':
    case '20.04':
      codename = 'focal'
      break
    default:
      codename = 'unsupported'
  }
  return codename
}

export const generatePuppetInstallScript = (platform: Platform, puppetCollection: string): string[] => {
  const collection = puppetCollection

  if (platform.family === 'debian') {
    const codename = fetchCodename(platform, collection)
    if (codename === 'unsupported') {
      throw new Error(`No builds for ${platform.label}`)
    } else {
      return [
        `curl -o puppet.deb http://apt.puppetlabs.com/${collection}-release-${codename}.deb`,
        'dpkg -i --force-confmiss puppet.deb',
        'apt-get update -y',
        'apt-get install puppetserver -y'
      ]
    }
  }

  if (platform.family === 'redhat') {
    return [
      `curl -o puppet.rpm http://yum.puppetlabs.com/${collection}/${collection}-release-el-${platform.majorversion}.noarch.rpm`,
      'rpm -Uvh puppet.rpm --quiet',
      'yum install puppetserver -y --quiet'
    ]
  }

  return []
}
