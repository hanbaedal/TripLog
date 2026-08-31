import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
)

const tripSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripId: { type: String, required: true },
    title: { type: String, default: '새로운 여행' },
    destination: { type: String, default: '' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 0 },
    items: { type: Array, default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

tripSchema.index({ ownerId: 1, tripId: 1 }, { unique: true })

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema)
