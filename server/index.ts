import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { config } from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import nodemailer from 'nodemailer'

config({ path: process.env.DOTENV_CONFIG_PATH || '.env.local' })

const app = express()
const port = Number(process.env.PORT) || 3001
const recipient = 'viral.prajapati.nmims@gmail.com'
const distDirectory = resolve(process.cwd(), 'dist')

app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
}))
app.use(express.json({ limit: '12kb' }))
app.use('/api/contact', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 4,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' },
}))

interface ContactPayload {
  candidateEmail?: unknown
  subject?: unknown
  message?: unknown
  website?: unknown
}

const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

app.get('/api/health', (_request, response) => {
  const emailConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    (process.env.SMTP_FROM || process.env.SMTP_USER),
  )
  response.status(200).json({ ok: true, emailConfigured })
})

app.post('/api/contact', async (request, response) => {
  const body = request.body as ContactPayload | undefined
  if (typeof body?.website === 'string' && body.website.trim()) {
    response.status(202).json({ ok: true })
    return
  }

  const candidateEmail = typeof body?.candidateEmail === 'string' ? body.candidateEmail.trim() : ''
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''

  if (!isEmail(candidateEmail) || candidateEmail.length > 254) {
    response.status(400).json({ error: 'Enter a valid email address.' })
    return
  }
  if (!subject || subject.length > 160 || /[\r\n]/.test(subject)) {
    response.status(400).json({ error: 'Subject must be between 1 and 160 characters.' })
    return
  }
  if (message.length < 10 || message.length > 8000) {
    response.status(400).json({ error: 'Message must be between 10 and 8000 characters.' })
    return
  }

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASS
  const portNumber = Number(process.env.SMTP_PORT) || 587
  const sender = process.env.SMTP_FROM || user

  if (!host || !user || !password || !sender) {
    response.status(503).json({ error: 'Email delivery is not configured.' })
    return
  }

  const transporter = nodemailer.createTransport({
    host,
    port: portNumber,
    secure: process.env.SMTP_SECURE === 'true' || portNumber === 465,
    auth: { user, pass: password },
  })

  try {
    await transporter.sendMail({
      from: sender,
      to: recipient,
      replyTo: candidateEmail,
      subject: `[Portfolio] ${subject}`,
      text: `From: ${candidateEmail}\n\n${message}`,
    })
    response.status(200).json({ ok: true })
  } catch (error) {
    console.error('SMTP delivery failed:', error instanceof Error ? error.name : 'unknown error')
    response.status(502).json({ error: 'Email delivery failed. Please try again later.' })
  } finally {
    transporter.close()
  }
})

if (existsSync(distDirectory)) {
  app.use(express.static(distDirectory))
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(resolve(distDirectory, 'index.html'))
  })
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Portfolio server listening on port ${port}`)
})
