import { Router } from 'express'
// import { allVms } from "./../helpers/db_utils";

const dashboardRouter = Router()

dashboardRouter.get('/', (_req, res) => {
  res.render('dashboard')
})

export default dashboardRouter
