#!/bin/bash

cat >>$(pwd)/src/tasks/generate_ssh_keypair.cjs <<JAVASCRIPT
const { randomBytes } = require('@noble/hashes/utils')
const sshImport = import('ed25519-keygen/ssh')

const generateKeypair = async sshUser => {
  try {
    const seed = randomBytes(32)
    const ssh = (await sshImport).default
    const { publicKey, privateKey } = await ssh(seed, sshUser)
    return { publicKey, privateKey }
  } catch (error) {
    throw error
  }
}
const sshUser = (process.argv[2]) ? process.argv[2].split('=')[1] : 'root'
generateKeypair(sshUser).then(result => console.log(JSON.stringify(result))).catch(error => console.log(error))
JAVASCRIPT

node $(pwd)/src/tasks/generate_ssh_keypair.cjs $1
rm $(pwd)/src/tasks/generate_ssh_keypair.cjs

exit 0
