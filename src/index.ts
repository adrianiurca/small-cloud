import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import { fetchDockerVersion } from './helpers/docker_version'
import { fetchVagrantVersion } from './helpers/vagrant_version'

dotenv.config()

const port = process.env.SERVER_PORT;
const app = express();

// configure express to use ejs
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (_req, res) => {
  res.render('index', {
    docker_version: fetchDockerVersion(),
    vagrant_version: fetchVagrantVersion()
  })
})

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`)
})