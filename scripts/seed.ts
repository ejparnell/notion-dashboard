/**
 * Seed script — creates a user from .env.local values.
 *
 * Required env vars:
 *   MONGODB_URI
 *   SEED_USER_NAME
 *   SEED_USER_EMAIL
 *   SEED_USER_PASSWORD
 *
 * Usage:
 *   pnpm seed
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI
const SEED_USER_NAME = process.env.SEED_USER_NAME
const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL
const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD

const missing = ['MONGODB_URI', 'SEED_USER_NAME', 'SEED_USER_EMAIL', 'SEED_USER_PASSWORD'].filter(
  (key) => !process.env[key]
)

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`)
  process.exit(1)
}

// Inline schema to avoid Next.js model-caching concerns in a plain Node script
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    hashedPassword: { type: String, required: true },
  },
  { timestamps: true }
)

async function seed() {
  console.log('Connecting to MongoDB…')
  await mongoose.connect(MONGODB_URI!)

  const User = mongoose.models.User ?? mongoose.model('User', UserSchema)

  const hashedPassword = await bcrypt.hash(SEED_USER_PASSWORD!, 12)

  const user = await User.findOneAndUpdate(
    { email: SEED_USER_EMAIL!.toLowerCase() },
    {
      name: SEED_USER_NAME,
      email: SEED_USER_EMAIL!.toLowerCase(),
      hashedPassword,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  console.log(`✓ User seeded: ${user.name} <${user.email}>`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
