import { Router } from 'express'

const authRouter = Router()

authRouter.get('/', (_req, res) => {
  res.render('auth')
})

export default authRouter
