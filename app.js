const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/views'));

//Database Connection Code.
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

app.get('/nav',(req,res)=>{
    res.render('partials/navbar');
})


app.get('/home',(req,res)=>{
    res.render('home');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/signup',(req,res)=>{
    res.render('signup');
})

app.get('*',(req,res)=>{
    res.send('Please Check Url Address');
})


app.listen(3000,()=>{
    console.log("App Stated");
})