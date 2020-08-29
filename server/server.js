import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios'
import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'

const { readFile, writeFile, unlink } = require("fs").promises

const Root = () => ''

try {
  // eslint-disable-next-line import/no-unresolved
  // ;(async () => {
  //   const items = await import('../dist/assets/js/root.bundle')
  //   console.log(JSON.stringify(items))

  //   Root = (props) => <items.Root {...props} />
  //   console.log(JSON.stringify(items.Root))
  // })()
  console.log(Root)
} catch (ex) {
  console.log(' run yarn build:prod to enable ssr')
}

let connections = []

const port = process.env.PORT || 8090
const server = express()

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser()
]

middleware.forEach((it) => server.use(it))

/*
server.get('/api/v1/users', async (req, res) => {
  const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
  res.json({users})
})
*/

/*
server.get('/api/v1/users/:name', (req, res) => {
  const { name } = req.params
  res.json({ name})
})
*/

server.get('/api/v1/users', (req, res) => {
   readFile(`${__dirname}/test.json`, { encoding: "utf8" })
   .then(usersText => {
     res.json( JSON.parse(usersText) )
   })
   .catch(err => {
     console.log(err)
    axios('https://jsonplaceholder.typicode.com/users')
    .then((response) => response.data)
    .then(data => {
      writeFile(`${__dirname}/test.json`, JSON.stringify(data), { encoding: "utf8" })
        res.json ( data )
    })
   })

})

server.post('/api/v1/users', (req, res) => {
  readFile(`${__dirname}/test.json`, { encoding: "utf8" })
  .then(usersInfo => {
    let ob = JSON.parse(usersInfo)
    const newId = Math.max.apply(0 ,ob.reduce((acc, rec) => {
      return [...acc, rec.id]
    }, [])) + 1
    ob = [...ob, {id: newId }]
    writeFile(`${__dirname}/test.json`, JSON.stringify(ob), { encoding: "utf8" })
    res.json( {status: 'success', id: newId} )
  })
  .catch(err => {
    res.json( {status: 'failed', error: err} )
    console.log(err)
  })
})

server.patch('/api/v1/users/:userid', (req, res) => {
  const { userid } = req.params
  const  update  = req.body
  readFile(`${__dirname}/test.json`, { encoding: "utf8" })
  .then(users => {
    let ob = JSON.parse(users)
    ob = ob.reduce((acc, rec) => {
      if (rec.id === Number(userid) ) {
        return [...acc, {...rec, ...update}]
      }
      return  [...acc, rec]
    }, [])
    writeFile(`${__dirname}/test.json`, JSON.stringify(ob), { encoding: "utf8" })
    res.json( {status: 'success', id: userid} )
  })
  .catch(err => {
    res.json( {status: 'failed', error: err} )
    console.log(err)
  })
})

server.delete('/api/v1/users/:userid', (req, res) => {
  const { userid } = req.params
  readFile(`${__dirname}/test.json`, {encoding: "utf8"})
  .then(usr => {
    let ob = JSON.parse(usr)
    ob = ob.reduce((acc,rec) => {
      if (rec.id === Number(userid)) {
        return [acc]
      }
      return [...acc, rec]
     },[])
     writeFile(`${__dirname}/test.json`, JSON.stringify(ob), { encoding: "utf8"})
     res.json({status: "success", id: userid})
  })
  .catch(err => {
    res.json({status: "failed", error: err})
  })
})

server.delete('/api/v1/users', (req, res) => {
  unlink(`${__dirname}/test.json`)
  .then( () => {
    res.json({status: "success"})
  })
  .catch(err => {
    res.json({status: "failed", error: err})
  })
})

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})




const [htmlStart, htmlEnd] = Html({
  body: 'separator',
  title: 'Skillcrucial - Become an IT HERO'
}).split('separator')

server.get('/', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }

  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)
