const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pgSchema = new Schema({
    title : String,
    price : Number,
    image : String,
    description : String,
    location : String,
    rating : String
})

module.exports = mongoose.model('pgModel',pgSchema);