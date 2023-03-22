import { GCPMachine } from './terraform'
import path, { dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
const filename = fileURLToPath(import.meta.url)
const localDirname = dirname(filename)

export interface DataBase {
  users: User[]
  vms: GCPMachine[]
}

export interface User {
  id: string
  username: string
  password: string
  email: string
}

export const saveUser = (user: User) => {
  const dbPath = path.join(localDirname, '/../db', 'db.json')
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    const updatedDb = [...db.users, user]
    db.users = updatedDb
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db))
    } catch(err) {
      throw err
    }
  } catch(err) {
    throw err
  }
}

export const saveVM = (vmData: GCPMachine) => {
  const dbPath = path.join(localDirname, '/../db', 'db.json')
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

export const updateUser = (newInfo: Partial<User>) => {
  const dbPath = path.join(localDirname, '/../db', 'db.json')
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    const updatedDb = db.users.map((user: User) => {
      if(user.id === newInfo.id) {
        return {
          ...user,
          ...newInfo
        }
      }
    })
    db.users = updatedDb
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db))
    } catch(err) {
      throw err
    }
  } catch(err) {
    throw err
  }
}

export const removeVM = (vmData: GCPMachine) => {
  const dbPath = path.join(localDirname, '/../db', 'db.json')
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    const updatedDb = db.vms.filter((machine: GCPMachine) => (machine.id !== vmData.id))
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

export const allVms = (): GCPMachine[] => {
  const dbPath: string = path.join(localDirname, '/../db', 'db.json')
  try {
    const db: DataBase = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    return db.vms
  } catch(err) {
    throw err
  }
}

export const allUsers = (): User[] => {
  const dbPath: string = path.join(localDirname, '/../db', 'db.json')
  try {
    const db: DataBase = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    return db.users
  } catch(err) {
    throw err
  }
}

export const getVmById = (id: string): GCPMachine | undefined => {
  const dbPath: string = path.join(localDirname, '/../db', 'db.json')
  try {
    const db: DataBase = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    return db.vms.find(machine => machine.id === id)
  } catch(err) {
    throw err
  }
}

export const getUserByUsername = (username: string): User | undefined => {
  const dbPath: string = path.join(localDirname, '/../db', 'db.json')
  try {
    const db: DataBase = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    return db.users.find(user => user.username === username)
  } catch(err) {
    throw err
  }
}

export const getUserById = (id: string): User | undefined => {
  const dbPath: string = path.join(localDirname, '/../db', 'db.json')
  try {
    const db: DataBase = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    return db.users.find(user => user.id === id)
  } catch(err) {
    throw err
  }
}

export const extendLifetime = (id: string, value: string): void => {
  const dbPath = path.join(localDirname, '/../db', 'db.json')
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, { encoding: 'utf8' }).toString())
    const updatedDb = db.vms.map((machine: GCPMachine) => {
      if(machine.id === id) {
        return {
          ...machine,
          lifetime: value
        }
      }
    })
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
