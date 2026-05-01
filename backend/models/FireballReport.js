const mongoose = require('mongoose');

const FireballReportSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    soundDelaySeconds: { type: Number },
    soundType: { type: String, enum: ['NONE', 'BOOM', 'WHISTLING', 'OTHER'], default: 'NONE' },
    color: { type: String },
    brightness: { type: String, enum: ['MOON', 'VENUS', 'SUN', 'STARRY_NIGHT'], default: 'VENUS' },
    fragmentation: { type: Boolean, default: false },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['IMAGE', 'VIDEO', 'NONE'], default: 'NONE' },
    status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});

FireballReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FireballReport', FireballReportSchema);
