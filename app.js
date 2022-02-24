const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/views'));
app.engine('ejs',ejsMate);

//to parse the body of post requests.
app.use(express.urlencoded({extended:true}));

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

app.get('/home', async (req,res)=>{
    const Pgs = await pgModel.find({});
    res.render('Pg/home',{Pgs});
})

app.get('/home/new',(req,res)=>{
    res.render('Pg/new');
})

app.get('home/show',(req,res)=>{
    res.render('Pg/show');
})

app.post('/home/new',async (req,res)=>{
    const Pg = new pgModel(req.body.pg);
    await Pg.save();
    res.redirect(`/home/${Pg._id}`);
})

app.get('/home/:id', async (req,res)=>{
    const Pg = await pgModel.findById(req.params.id);
    res.render('view',{Pg});
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/signup',(req,res)=>{
    res.render('signup');
})

app.get('/contact',(req,res)=>{
    res.render('contact');
})

app.get('/userGuide',(req,res)=>{
    res.render('Guides/UserGuidelines')
})

app.get('*',(req,res)=>{
    res.send('Please Check Url Address');
})


app.listen(3000,()=>{
    console.log("App Stated");
})