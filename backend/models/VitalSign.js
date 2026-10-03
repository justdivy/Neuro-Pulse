const mongoose = require('mongoose');

const vitalSignSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  heartRate: {
    type: Number,
    required: true
  },
  spO2: {
    type: Number,
    required: true
  },
  temp: {
    type: Number,
    required: true
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VitalSign', vitalSignSchema);