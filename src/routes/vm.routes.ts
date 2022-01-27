import { Router } from "express";
import { VagrantMachine, provision, teardown } from "../helpers/vagrant";
import { allVms, lastIndex, getVmById, extendLifetime, saveVM, removeVM } from "../helpers/db_utils";

const vmRouter = Router()

vmRouter.get('/all', (_req, res) => {
  return res.status(200).json({ vm_list: allVms() })
})

vmRouter.post('/new', (req, res) => {
  provision(req.body)
    .then(result => {
      try {
        saveVM(result)
        return res.status(200).json(result)
      } catch(err) {
        return res.status(500).json(err)
      }
    })
    .catch(reason => res.status(500).json(reason))
})

vmRouter.get('/details/:id', (req, res) => {
  const id: number = parseInt(req.params.id, 10)
  if(id > lastIndex()) {
    return res.status(404).json({ message: 'not found!' })
  } else {
    const vm: VagrantMachine = getVmById(id)
    return res.status(200).json({
      vm_details: {
        ...vm.vm_details,
        ip: vm.vm_ip,
        hostname: vm.vm_hostname,
        username: vm.vm_user,
        password: vm.vm_password,
        owner: vm.vm_owner,
        lifetime: vm.vm_lifetime
      }
    })
  }
})

vmRouter.get('/details', (_req, res) => {
  res.render('details')
})

vmRouter.put('/edit/:id', (req, res) => {
  const id: number = parseInt(req.params.id, 10)
  if(id > lastIndex()) {
    res.status(404).json({ message: 'not found!' })
  } else {
    try {
      const lifetime = parseInt(req.body.lifetime, 10)
      if(lifetime.toString() === 'NaN') {
        return res.status(400).json({ status: 'Not a number' })
      }
      if(lifetime > 72) {
        return res.status(406).json({ status: 'lifetime can not be greater than 72 hours' })
      }
      if(lifetime <= parseInt(getVmById(id).vm_lifetime, 10)) {
        return res.status(406).json({ status: 'lifetime can not be less than lifetime already set for this machine' })
      }
      extendLifetime(id, `${lifetime}h`)
      return res.status(200).json({ status: 'saved' })
    } catch(err) {
      return res.status(500).json(err)
    }
  }
})

vmRouter.delete('/:id', (req, res) => {
  const id: number = parseInt(req.params.id, 10)
  if(id > lastIndex()) {
    return res.status(404).json({ message: 'not found!' })
  } else {
    const vm: VagrantMachine = getVmById(id)
    teardown(vm)
      .then(result => {
        try {
          removeVM(vm)
          return res.status(200).json({ message: result })
        } catch(err) {
          return res.status(500).json(err)
        }
      })
      .catch(reason => res.status(500).json(reason))
  }
})

export default vmRouter
