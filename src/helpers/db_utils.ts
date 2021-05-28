import { VagrantMachine } from "./vagrant";
import path from 'path'
import fs from 'fs'

export interface DataBase {
  users: String[]
  vms: VagrantMachine[]
}

export const saveVM = (vmData: VagrantMachine) => {
  const dbPath = path.join(__dirname, '/../db', 'db.json')
  try {
    let db = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    const updatedDb = [...db.vms, vmData]
    db.vms = updatedDb
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db))
    } catch(err) {
      throw err
    }
  } catch(err) {
    throw err
  }
}
  
export const removeVM = (vmData: VagrantMachine) => {
  const dbPath = path.join(__dirname, '/../db', 'db.json')
  try {
    let db = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    const updatedDb = db.vms.filter((machine: VagrantMachine) => machine.vm_ip != vmData.vm_ip)
    db.vms = updatedDb
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db))
    } catch(err) {
      throw err
    }
  } catch(err) {
    throw err
  }
}

export const allVms = ():VagrantMachine[] => {
  const dbPath: string = path.join(__dirname, '/../db', 'db.json')
  try {
    let db: DataBase = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    return db.vms
  } catch(err) {
    throw err
  }
}

export const getVmByHostname = (hostname: string):VagrantMachine => {
  const dbPath: string = path.join(__dirname, '/../db', 'db.json')
  try {
    let db: DataBase = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    return db.vms.find(machine => machine.vm_hostname == hostname)
  } catch(err) {
    throw err
  }
}
