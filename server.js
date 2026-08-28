const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const app = express()
const db = require('./db')

const port = process.env.PORT || 3000

app.use(express.json())

app.set('trust proxy', 1)

app.use(helmet())
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many attempts, please try again later.',
})

app.use('/login', authLimiter)

app.get('/', (req, res) => {
  res.send('Node server is working')
})

// Get all users from the database and return them as JSON.
app.get('/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all()

  res.json(users)
})

app.post('/users', (req, res) => {
  const { name, email } = req.body

  const result = db
    .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
    .run(name, email)

  res.status(201).json({
    id: result.lastInsertRowid,
    name,
    email,
  })
})
// Start the server and listen on the specified port.
app.listen(port, '127.0.0.1', () => {
  console.log(`Server running on port ${port}`)
})
