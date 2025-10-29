const mongoose = require('mongoose');

const esgSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  blockchainRecordId: {
    type: Number,
    required: true
  },
  transactionHash: {
    type: String,
    required: true
  },
  dataType: {
    type: String,
    required: true,
    enum: ['carbon_emissions', 'water_usage', 'energy_consumption', 
           'waste_generation', 'labor_audit', 'supply_chain_ethics', 'other']
  },
  value: {
    type: String,
    required: true
  },
  unit: String,
  reportingPeriod: {
    startDate: Date,
    endDate: Date
  },
  documentHash: String,
  documentUrl: String,
  metadata: {
    type: Map,
    of: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ESGSubmission', esgSubmissionSchema);
