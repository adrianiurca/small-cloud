import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import { fetchDockerVersion } from './helpers/docker_version'
import { fetchVagrantVersion } from './helpers/vagrant_version'
import routes from './routes'
// import expressLayouts from 'express-ejs-layouts'

dotenv.config()

const port = process.env.SERVER_PORT;
const app = express();

// configure express to use ejs
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(routes)
// app.use(expressLayouts)

app.get('/', (_req, res) => {
  res.render('index', {
    docker_version: fetchDockerVersion(),
    vagrant_version: fetchVagrantVersion()
  })
})

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`)
})
