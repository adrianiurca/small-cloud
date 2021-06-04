import { Router } from "express";
import { VagrantMachine, provision, teardown } from "../helpers/vagrant";
import { allVms, lastIndex, getVmById, saveVM, removeVM } from "../helpers/db_utils";

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
    return res.status(404).json({ message: "not found!" })
  } else {
    const vm: VagrantMachine = getVmById(id)
    return res.status(200).json({ vm_details: vm.vm_details })
  }
})

vmRouter.delete('/:id', (req, res) => {
  const id: number = parseInt(req.params.id, 10)
  if(id > lastIndex()) {
    return res.status(404).json({ message: "not found!" })
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
