import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'supervisor'], default: 'user' },
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
    savedByUser: { type: Boolean },
    publishedSampleId: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

tripSchema.index({ ownerId: 1, tripId: 1 }, { unique: true })

const flightSnapSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    sourceDate: { type: String, required: true },
    live: { type: Boolean, default: false },
    flights: { type: Array, default: [] },
    fetchedAt: { type: Date, default: Date.now },
    expireAt: { type: Date, required: true },
  },
  { timestamps: false },
)
flightSnapSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

const sampleSchema = new mongoose.Schema(
  {
    sampleId: { type: String, required: true, unique: true },
    sort: { type: Number, default: 99 },
    nights: { type: Number, required: true },
    place: { type: String, required: true },
    title: { type: String, required: true },
    destination: { type: String, default: '' },
    trip: { type: Object, required: true },
    ownerId: { type: String, default: '', index: true },
    ownerName: { type: String, default: '' },
    sourceTripId: { type: String, default: '' },
  },
  { timestamps: true },
)

const gallerySchema = new mongoose.Schema(
  {
    photoId: { type: String, required: true, unique: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    ownerName: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    src: { type: String, required: true },
    catalog: { type: Boolean, default: false },
    at: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

const boardSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true, unique: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    at: { type: Date, default: Date.now },
    comments: {
      type: [
        {
          commentId: { type: String, required: true },
          ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
          name: { type: String, required: true, trim: true },
          body: { type: String, required: true, trim: true },
          at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
)

const travelInfoSchema = new mongoose.Schema(
  {
    infoId: { type: String, required: true, unique: true },
    place: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    photoId: { type: String, default: '', trim: true },
    src: { type: String, default: '' },
    sort: { type: Number, default: 80 },
    catalog: { type: Boolean, default: false },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    ownerName: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

const inquirySchema = new mongoose.Schema(
  {
    inquiryId: { type: String, required: true, unique: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    at: { type: Date, default: Date.now },
    reply: { type: String, default: '' },
    replyAt: { type: Date },
  },
  { timestamps: true },
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema)
export const FlightSnap = mongoose.models.FlightSnap || mongoose.model('FlightSnap', flightSnapSchema)
export const Sample = mongoose.models.Sample || mongoose.model('Sample', sampleSchema)
export const GalleryPhoto = mongoose.models.GalleryPhoto || mongoose.model('GalleryPhoto', gallerySchema)
export const BoardPost = mongoose.models.BoardPost || mongoose.model('BoardPost', boardSchema)
export const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema)
export const TravelInfo = mongoose.models.TravelInfo || mongoose.model('TravelInfo', travelInfoSchema)

const travelSpotSchema = new mongoose.Schema(
  {
    spotId: { type: String, required: true, unique: true },
    cityId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    tip: { type: String, default: '', trim: true },
    photoId: { type: String, default: '', trim: true },
    src: { type: String, default: '' },
    sort: { type: Number, default: 80 },
    catalog: { type: Boolean, default: false },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    ownerName: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const TravelSpot = mongoose.models.TravelSpot || mongoose.model('TravelSpot', travelSpotSchema)
