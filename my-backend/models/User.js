const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    favoritePlants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plant'
    }],
    userGarden: [{
        plant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plant'
        },
        plantedDate: {
            type: Date,
            default: Date.now
        },
        notes: String,
        status: {
            type: String,
            enum: ['seed', 'seedling', 'growing', 'mature', 'harvested'],
            default: 'seed'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);