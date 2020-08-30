import express from 'express'
import minimist from 'minimist'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import * as jsonpatch from 'fast-json-patch'
import * as util from 'util'
import * as http from 'http'
import * as WebSocket from 'ws'
import * as qs from 'querystring'
import * as url from 'url'
import { setWsHeartbeat } from 'ws-heartbeat/server'

const server = http.createServer()
const wss = new WebSocket.Server({ server })
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

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const statAsync = util.promisify(fs.stat)

app.use(bodyParser.json())

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.get('/:key', async (req, res) => {
  try {
    const filePath = path.resolve(filesPath, req.params.key)
    await statAsync(filePath)
    res.setHeader('Content-Type', 'application/json')
    res.send(await readFileAsync(filePath))
  } catch (error: unknown) {
    res.status(404)
    res.end(error instanceof Error ? error.message : String(error))
  }
})

app.post('/:key', async (req, res) => {
  try {
    const filePath = path.resolve(filesPath, req.params.key)
    await writeFileAsync(filePath, JSON.stringify((req as { body: unknown }).body))
    res.setHeader('Content-Type', 'application/json')
    res.send(await readFileAsync(filePath))
  } catch (error: unknown) {
    res.status(400)
    res.end(error instanceof Error ? error.message : String(error))
  }
})

const connections: Array<{ key: string, ws: WebSocket }> = []

async function patch(key: string, operations: jsonpatch.Operation[]) {
  const filePath = path.resolve(filesPath, key)
  const data = await readFileAsync(filePath)
  const json = JSON.parse(data.toString()) as unknown
  const newJson = jsonpatch.applyPatch(json, operations).newDocument
  await writeFileAsync(filePath, JSON.stringify(newJson))
  return newJson
}

app.patch('/:key', async (req, res) => {
  try {
    const key = req.params.key
    const operations = (req as { body: jsonpatch.Operation[] }).body
    const newJson = await patch(key, operations)
    for (const connection of connections) {
      if (connection.key === key) {
        connection.ws.send(JSON.stringify(operations))
      }
    }
    res.json(newJson).end()
  } catch (error: unknown) {
    res.status(400)
    res.end(error instanceof Error ? error.message : String(error))
  }
})

setWsHeartbeat(wss, (ws, data: unknown) => {
  if (data === '{"method":"ping"}') {
    ws.send('{"method":"pong"}')
  }
})

wss.on('connection', (ws, req) => {
  if (req.url) {
    const query = url.parse(req.url).query
    if (query) {
      const key = qs.parse(query).key
      if (key && typeof key === 'string') {
        connections.push({ key, ws: ws as WebSocket })

        ws.on('close', () => {
          const index = connections.findIndex((c) => c.ws === ws)
          if (index >= 0) {
            connections.splice(index, 1)
          }
        })

        ws.on('message', async (data) => {
          if (typeof data === 'string') {
            const json = JSON.parse(data) as {
              method: 'patch'
              operations: jsonpatch.Operation[]
            } | {
              method: 'ping'
            }
            if (json.method === 'ping') {
              return
            }
            if (json.method === 'patch') {
              await patch(key, json.operations)
            }
          }
          for (const connection of connections) {
            if (connection.key === key && connection.ws !== ws) {
              connection.ws.send(data)
            }
          }
        })
      }
    }
  }
})

server.on('request', app)
server.listen(port, host, () => {
  console.log(`storage service is listening: ${host}:${port}`)
})

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})
