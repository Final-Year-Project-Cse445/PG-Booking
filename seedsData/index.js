const mongoose = require('mongoose');
const { pgs } = require('./pglist');
const pg = require('../models/Pgmodel');

mongoose.connect('mongodb://localhost:27017/test01');

const db = mongoose.connection;
db.on('error',console.error.bind(console,"Database Connection Error"));
db.once('open',()=>{
    console.log("Database Connected");
})

const seedDB = async ()=>{
    await pg.deleteMany({});
    for(let i=0; i<pgs.length; i++){
        const Pg = new pg({
            author: '62406b5d011143e12dcf6358',
            title: `${pgs[i].title}`,
            price: `${pgs[i].price}`,
            description: `${pgs[i].description}`,
            location: `${pgs[i].location}`, 
            rating: `${pgs[i].rating}`,
            image : `https://images.unsplash.com/photo-1646265849745-39ddf45677c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY0NzAwMjI2MQ&ixlib=rb-1.2.1&q=80&w=1080`,
        });
        await Pg.save();
    }

}

seedDB().then(()=>{
    mongoose.connection.close();
})