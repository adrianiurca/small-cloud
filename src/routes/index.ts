import { Router } from 'express'
import dashboardRouter from './dashboard.routes.js'
import vmRouter from './vm.routes.js'
import userRouter from './user.routes.js'
import signupRouter from './signup.routes.js'
import authRouter from './auth.routes.js'
import menuRouter from './menu.routes.js'

const routes = Router()

routes.use('/dashboard', dashboardRouter)
routes.use('/vm', vmRouter)
routes.use('/user', userRouter)
routes.use('/signup', signupRouter)
routes.use('/auth', authRouter)
routes.use('/menu', menuRouter)

export default routes
