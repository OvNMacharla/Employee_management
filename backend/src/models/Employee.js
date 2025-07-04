const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
    required: true
  },
  checkIn: Date,
  checkOut: Date,
  hoursWorked: Number
});

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  attendance: [attendanceSchema],
  salary: {
    type: Number,
    min: 0
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: String,
    address: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ name: 1 });
employeeSchema.index({ class: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ isActive: 1 });
employeeSchema.index({ createdAt: -1 });

// Compound indexes for common queries
employeeSchema.index({ class: 1, isActive: 1 });
employeeSchema.index({ department: 1, isActive: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
