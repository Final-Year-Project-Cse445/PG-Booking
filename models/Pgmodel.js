const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pgSchema = new Schema({
    title : String,
    price : Number,
    description : String,
    location : String,
    rating : Number
})

module.exports = mongoose.model('pgModel',pgSchema);