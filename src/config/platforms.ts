export interface Platform {
  box: string,
  name: string,
  label: string,
  googlefamily?: string,
  family: string,
  majorversion: string
  url: string
}

export const platformList: {
  google: Platform[],
  virtualbox: Platform[]
} = {
  google: [
    {
      box: 'centos-7-v20221102',
      name: 'centos',
      label: 'CentOS 7',
      family: 'redhat',
      googlefamily: 'centos-7',
      majorversion: '7',
      url: 'http://google.com'
    }
  ],
  virtualbox: [
    {
      box: 'generic/centos7',
      name: 'centos',
      label: 'CentOS 7',
      family: 'redhat',
      majorversion: '7',
      url: 'https://app.vagrantup.com/generic/boxes/centos7/versions/3.2.20/providers/virtualbox.box'
    },
    {
      box: 'generic/centos8',
      name: 'centos',
      label: 'CentOS 8',
      family: 'redhat',
      majorversion: '8',
      url: 'https://app.vagrantup.com/generic/boxes/centos8/versions/3.2.20/providers/virtualbox.box'
    },
    {
      box: 'generic/rhel7',
      name: 'redhat',
      label: 'RedHat 7',
      family: 'redhat',
      majorversion: '7',
      url: 'https://app.vagrantup.com/generic/boxes/rhel7/versions/3.2.20/providers/virtualbox.box'
    },
    {
      box: 'generic/debian9',
      name: 'debian',
      label: 'Debian 9',
      family: 'debian',
      majorversion: '9',
      url: 'https://app.vagrantup.com/generic/boxes/debian9/versions/3.3.2/providers/virtualbox.box'
    }
  ]
}