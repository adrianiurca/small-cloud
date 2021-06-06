import { Router } from "express";
import dashboardRouter from './dashboard.routes'
import vmRouter from "./vm.routes";

const routes = Router()

routes.use('/dashboard', dashboardRouter)
routes.use('/vm', vmRouter)

export default routes
