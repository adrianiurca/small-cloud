import express from 'express'
import path, { dirname } from 'path'
import dotenv from 'dotenv'
import { fetchDockerVersion } from './helpers/docker_version.js'
import { fetchVagrantVersion } from './helpers/vagrant_version.js'
import LOG from './helpers/log_utils.js'
import routes from './routes/index.js'
import Cors from 'cors'
import passport from 'passport'
import './config/passport.js'
import { fileURLToPath } from 'url'
const filename = fileURLToPath(import.meta.url)
const localDirname = dirname(filename)

dotenv.config()

const port = process.env.PORT || 8080
const app = express()

// configure express
app.set('views', path.join(localDirname, 'views'))
app.set('view engine', 'ejs')
app.use('/static', express.static(path.join(localDirname, 'public')))
app.use(express.json())
app.use(routes)
app.use(Cors())
app.use(passport.initialize())

app.get('/', async (_req, res) => {
  res.render('index', {
    docker_version: await fetchDockerVersion(),
    vagrant_version: await fetchVagrantVersion()
  })
})

const server = app.listen(port, () => LOG(`server started at http://localhost:${port}`))

process.on('SIGTERM', () => server.close())

process.on('uncaughtException', () => server.close())

export default app
