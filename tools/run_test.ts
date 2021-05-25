// import { VagrantDetails, provision, teardown } from './vagrant'
// import { saveVM, getVmByHostname, removeVM } from './db_utils'

// const machine1: VagrantDetails = {
//   vm_user: 'adrian',
//   vm_password: 'testcloud',
//   vm_box: 'generic/centos7',
//   vm_owner: 'user1'
// }

// const machine2: VagrantDetails = {
//   vm_box: 'generic/debian10',
//   vm_owner: 'user2'
// }

// provision(machine1)
//   .then(res => saveVM(res))
//   .catch(error => console.log(error))

// provision(machine2)
//   .then(res => saveVM(res))
//   .catch(error => console.log(error))

// teardown(getVmByHostname('eye-sink.vm'))
//   .then(res => console.log(res))
//   .catch(error => console.log(error))

// removeVM(getVmByHostname('eye-sink.vm'))
import randomString = require('randomstring')
import { VagrantDetails } from '../src/helpers/vagrant'

let machine: VagrantDetails = {
    // vm_user: undefined,
    // vm_password: undefined,
    // vm_ip: '192.168.0.106',
    vm_box: 'generic/centos7',
    // vm_hostname: 'turn-gravity.vm',
    // vm_path: '/Users/adrian.iurca/Desktop/projects/adrianiurca/small-cloud/src/helpers/machine-37527bf2-2784-4954-bd4e-6533fa9c2fc3',
    vm_owner: 'user1'
  }

machine.vm_user = (typeof(machine.vm_user) === 'undefined') ? randomString.generate() : machine.vm_user
machine.vm_password = (typeof(machine.vm_password) === 'undefined') ? randomString.generate() : machine.vm_password

console.log(machine)