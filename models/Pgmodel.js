const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const pgSchema = new Schema({
    title : String,
    price : Number,
    image : String,
    description : String,
    location : String,
    rating : String,
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews : [
        {
            type:Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
});

// if one pg is deleted then along with that all reviews also will get deleted code.
pgSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('pgModel',pgSchema);