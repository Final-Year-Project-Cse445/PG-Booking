const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMonggose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: 'string',
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMonggose);

module.exports = mongoose.model('User',userSchema);