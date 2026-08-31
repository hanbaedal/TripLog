import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { authRouter } from './routes/auth.js'
import { tripsRouter } from './routes/trips.js'
import { flightsRouter } from './routes/flights.js'
import { samplesRouter, seedSamples } from './routes/samples.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT) || 3001
const mongoUri = process.env.MONGODB_URI
const origin = process.env.CORS_ORIGIN
const corsOrigins = [
  ...(origin ? origin.split(',').map((s) => s.trim()).filter(Boolean) : []),
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
]

app.use(express.json({ limit: '2mb' }))
app.use(
  cors({
    origin: origin ? corsOrigins : true,
  }),
)

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? 'up' : 'down',
    service: 'TripLog',
  })
})

app.use('/api/auth', authRouter)
app.use('/api/trips', tripsRouter)
app.use('/api/flights', flightsRouter)
app.use('/api/samples', samplesRouter)

const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) next()
  })
})

async function start() {
  if (!mongoUri) {
    console.error('MONGODB_URI is missing')
    process.exit(1)
  }
  await mongoose.connect(mongoUri, { dbName: process.env.MONGODB_DB || 'triplog' })
  await seedSamples()
  app.listen(port, () => {
    console.log(`TripLog listening on ${port}`)
  })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
