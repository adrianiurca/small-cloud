import { VagrantMachine } from "./vagrant";
import path from 'path'
import fs from 'fs'

export interface DataBase {
  users: string[]
  vms: VagrantMachine[]
}

export const saveVM = (vmData: VagrantMachine) => {
  const dbPath = path.join(__dirname, '/../db', 'db.json')
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
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
    const db = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    const updatedDb = db.vms.filter((machine: VagrantMachine) => machine.vm_id !== vmData.vm_id)
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
    const db: DataBase = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    return db.vms
  } catch(err) {
    throw err
  }
}

export const getVmById = (id: number):VagrantMachine => {
  const dbPath: string = path.join(__dirname, '/../db', 'db.json')
  try {
    const db: DataBase = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    return db.vms.find(machine => machine.vm_id === id)
  } catch(err) {
    throw err
  }
}

export const lastIndex = (): number => {
  const vms = allVms()
  if(vms.length > 0) {
    const arr = vms.map(vm => vm.vm_id)
    return arr[arr.length - 1]
  } else {
    return 0
  }
}
