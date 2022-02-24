const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/views'));
app.engine('ejs',ejsMate);

//Database Connection Code.
const pgModel = require('./models/Pgmodel');
mongoose.connect('mongodb://localhost:27017/test01')
    .then(()=>{ console.log('Database Connected') })
    .catch((error)=>{ 
    console.log('Error in Connecting Databse');
    console.log(error);
})


//Routes
app.get('/',(req,res)=>{
    res.render('Landing');
})

// app.get('/nav',(req,res)=>{
//     res.render('partials/navbar');
// })


app.get('/home',(req,res)=>{
    res.render('home');
})

app.get('/login',(req,res)=>{
    res.render('login');
})
app.get('/show',(req,res)=>{
    res.render('show');
})

app.get('/signup',(req,res)=>{
    res.render('signup');
})

app.get('/contact',(req,res)=>{
    res.render('contact');
})

// app.get('/test', async (req,res)=>{
//     const pg = new pgModel({title:'First',price:67});
//     await pg.save();
//     res.send(pg);
// })



app.get('*',(req,res)=>{
    res.send('Please Check Url Address');
})


app.listen(3000,()=>{
    console.log("App Stated");
})