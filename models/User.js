const mongoose = require('mongoose');
const argon2 = require('argon2');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    }
})


const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;