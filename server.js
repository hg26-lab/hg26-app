const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const app = express()
const db = require('./db')
const crypto = require('node:crypto')
const { body, validationResult } = require('express-validator')

const port = process.env.PORT || 3000

app.use(express.json({ limit: '10kb' }))

app.set('trust proxy', 1)

app.use(helmet())

const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .escape(),

  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),

  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      })
    }

    next()
  },
]

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
const crypto = require('node:crypto')

function requireApiKey(req, res, next) {
  const suppliedKey = req.get('x-api-key')
  const expectedKey = process.env.API_KEY

  if (!expectedKey || !suppliedKey) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const suppliedBuffer = Buffer.from(suppliedKey)
  const expectedBuffer = Buffer.from(expectedKey)

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return res.status(401).json({ error: 'Invalid API key' })
  }

  next()
}

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

app.post('/users', requireApiKey, validateUser, (req, res) => {
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
