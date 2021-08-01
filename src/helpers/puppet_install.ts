export const parsePlatform = (platform: string, target: string) => {
  const data: string[] = platform.match(/^generic\/([a-zA-Z]+)(\d+)/i)

  if(target === 'osname') {
    return data[1]
  } else if(target === 'majorversion') {
    return data[2]
  } else {
    throw new Error((`Could not fetch the ${target}`))
  }
}

export const fetchOSFamily = (osname: string) => {
  if(['debian', 'ubuntu'].includes(osname)) {
    return 'debian'
  } else if(['redhat', 'rhel', 'centos', 'scientific', 'oraclelinux'].includes(osname)) {
    return 'redhat'
  } else {
    return 'unsupported'
  }
}

const fetchCodename = (collection: string, majorVersion: string) => {
  let codename = 'unsupported'
  switch(majorVersion) {
    case '8':
      if(collection === 'puppet6') {
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
      if(collection === 'puppet6') {
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

export const generatePuppetInstallScript = (platform: string, puppetCollection: string): string[] => {
  const osname = parsePlatform(platform, 'osname')
  const majorVersion = parsePlatform(platform, 'majorversion')
  const osfamily = fetchOSFamily(osname)
  const collection = puppetCollection

  if(osfamily === 'unsupported') {
    throw new Error((`No builds for ${platform}`))
  }

  if(osfamily === 'debian') {
    const codename = fetchCodename(collection, majorVersion)
    if(codename === 'unsupported') {
      throw new Error((`No builds for ${platform}`))
    } else {
      return [
        `curl -o puppet.deb http://apt.puppetlabs.com/${collection}-release-${codename}.deb`,
        'dpkg -i --force-confmiss puppet.deb',
        'apt-get update -y',
        'apt-get install puppetserver -y'
      ]
    }
  }

  if(osfamily === 'redhat') {
    return [
      `curl -o puppet.rpm http://yum.puppetlabs.com/${collection}/${collection}-release-el-${majorVersion}.noarch.rpm`,
      'rpm -Uvh puppet.rpm --quiet',
      'yum install puppetserver -y --quiet'
    ]
  }
}
