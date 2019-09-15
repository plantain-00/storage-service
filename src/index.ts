import express from 'express'
import minimist from 'minimist'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

const app = express()
const argv = minimist(process.argv.slice(2)) as {
  p?: number
  h?: string
}
const port = argv.p || 9245
const host = argv.h || 'localhost'

const filesPath = path.resolve(__dirname, '../files')
try {
  fs.mkdirSync(filesPath)
} catch {
  // do nothing
}

app.use(bodyParser.json())

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.get('/:key', (req, res) => {
  const filePath = path.resolve(filesPath, req.params.key)
  fs.stat(filePath, (error) => {
    if (error) {
      res.status(404)
      res.end(error.message)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.send(fs.readFileSync(filePath))
    }
  })
})

app.post('/:key', (req, res) => {
  const filePath = path.resolve(filesPath, req.params.key)
  fs.writeFile(filePath, JSON.stringify((req as { body: unknown }).body), (error) => {
    if (error) {
      res.status(400)
      res.end(error.message)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.send(fs.readFileSync(filePath))
    }
  })
})

app.listen(port, host, () => {
  console.log(`storage service is listening: ${host}:${port}`)
})

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})
