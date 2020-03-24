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
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  discret_time: {
    type: Number,
  },
  date: {
    type: Date,
  },
  location: pointSchema,
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
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
  },
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
