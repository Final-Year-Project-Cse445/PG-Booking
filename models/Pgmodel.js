const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pgSchema = new Schema({
    title : String,
    price : Number,
    description : String,
    location : String,
})

module.exports = mongoose.model('pgModel',pgSchema);