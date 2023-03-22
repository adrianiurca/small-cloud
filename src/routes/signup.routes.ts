import { Router } from 'express'

const signupRouter = Router()

signupRouter.get('/', (_req, res) => {
  res.render('signup')
})

export default signupRouter
