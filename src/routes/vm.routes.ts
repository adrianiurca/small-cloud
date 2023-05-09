import { Router } from 'express'
import {
  GCPMachine,
  terraformApply,
  terraformDestroy,
} from '../helpers/terraform.js'
import {
  allVms,
  getVmById,
  extendLifetime,
  saveVM,
  removeVM,
} from '../helpers/db_utils.js'
import { Platform, platformList } from '../config/platforms.js'
import LOG from '../helpers/log_utils.js'

const vmRouter = Router()

vmRouter.get('/all', (_req, res) => {
  return res.status(200).json({ vm_list: allVms() })
})

vmRouter.post('/new', async (req, res) => {
  try {
    LOG('POST /vm/new entry point')
    const newVM: GCPMachine = await terraformApply(req.body)
    saveVM(newVM)
    return res.status(200).json(newVM)
  } catch (error) {
    return res.status(500).json(error)
  }
})

vmRouter.get('/details/:id', (req, res) => {
  const { id } = req.params
  const vm: GCPMachine | undefined = getVmById(id)
  if (vm) {
    return res.status(200).json({
      ip: vm.ipv4Address,
      hostname: vm.hostname,
      username: vm.sshUser,
      password: vm.ed25519Keypath,
      owner: vm.ownerId,
      lifetime: vm.lifetime,
    })
  } else {
    return res.status(404).json({ message: 'not found!' })
  }
})

vmRouter.get('/details', (_req, res) => {
  res.render('details')
})

vmRouter.put('/edit/:id', (req, res) => {
  const { id } = req.params
  const vm: GCPMachine | undefined = getVmById(id)
  if (vm) {
    try {
      const { lifetime } = req.body
      if (lifetime.toString() === 'NaN') {
        return res.status(400).json({ status: 'Not a number' })
      }
      if (lifetime > 72) {
        return res
          .status(406)
          .json({ status: 'lifetime can not be greater than 72 hours' })
      }
      if (lifetime <= parseInt(vm.lifetime, 10)) {
        return res.status(406).json({
          status:
            'lifetime can not be less than lifetime already set for this machine',
        })
      }
      extendLifetime(id, `${lifetime}h`)
      return res.status(200).json({ status: 'saved' })
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(404).json({ message: 'not found!' })
  }
})

vmRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  const vm: GCPMachine | undefined = getVmById(id)
  if (vm) {
    try {
      const response = await terraformDestroy(vm)
      removeVM(vm)
      return res.status(200).json({ message: response })
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(404).json({ message: 'not found!' })
  }
})

vmRouter.get('/platforms', (_req, res) => {
  if (process.env.VM_PROVIDER === 'google') {
    const googleVMs: Platform[] = platformList.google
    res.status(200).send(googleVMs)
  } else if (process.env.VM_PROVIDER === 'aws') {
    // list for AWS
  } /* default provider: virtualbox */ else {
    res.status(200).send(platformList.virtualbox)
  }
})

export default vmRouter
