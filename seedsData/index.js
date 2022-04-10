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
            author: '6251868b713bdbbed9c23409',
            title: `${pgs[i].title}`,
            price: `${pgs[i].price}`,
            description: `${pgs[i].description}`,
            location: `${pgs[i].location}`, 
            rating: `${pgs[i].rating}`,
            image : [
                {
                    url: 'https://res.cloudinary.com/dalt2i8bs/image/upload/v1649510082/GMP/sh8bxljfza4nuwfqoinb.jpg',
                    filename: 'GMP/atvvyhmo5uogkk3hkwit',
                  }
            ]
        });
        await Pg.save();
    }

}

seedDB().then(()=>{
    mongoose.connection.close();
})