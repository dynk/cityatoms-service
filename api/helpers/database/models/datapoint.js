const mongoose = require('mongoose')

const Schema = mongoose.Schema

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'Point',
    required: true,
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
    required: true,
  },
})

const DatapointSchema = new Schema({
  imei: {
    type: String,
    required: true,
  },
  time: {
    type: Schema.Types.Date,
    default: null,
  },
  time_utc: {
    type: Number,
  },
  created_at: {
    type: Schema.Types.Date,
    default: null,
  },
  location: pointSchema,
  lat: {
    type: Number,
    required: true,
  },
  lon: {
    type: Number,
    required: true,
  },
  symptom_scores: {
    cough: {
      type: Number,
    },
    throat: {
      type: Number,
    },
    fever: {
      type: Number,
    },
    smell: {
      type: Number,
    },
    breathing: {
      type: Number,
    },
    pneumonia: {
      type: Number,
    },
    c19: {
      type: Number,
    },
    hospital: {
      type: Number,
    },
    score: {
      type: Number,
    },
  },
},
{
  timestamps: { createdAt: 'created_at' },
})

DatapointSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret.__v
    delete ret._id
    delete ret.password
  },
})


module.exports = mongoose.model('datapoint', DatapointSchema)
