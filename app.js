const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const catchAsync = require('./ErrorHandlers/catchAsync');
const ExpresError = require('./ErrorHandlers/ExpressError');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/views'));
app.engine('ejs',ejsMate);

//to parse the body of post requests.
app.use(express.urlencoded({extended:true}));

//to overide and use method like update and delete.
app.use(methodOverride('_method'));

//Database Connection Code.
const pgModel = require('./models/Pgmodel');
const res = require('express/lib/response');
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

app.get('/home/show',(req,res)=>{
    res.render('Pg/show');
})

app.post('/home/new',catchAsync(async (req,res,next)=>{
    if(!req.body.pg) throw new ExpresError('Invalid Pg Data',400);
        const Pg = new pgModel(req.body.pg);
        await Pg.save();
        res.redirect(`/home/${Pg._id}`);
}))

app.get('/home/:id', catchAsync(async (req,res)=>{
    if(!req.params.id) throw new ExpresError('Invalid Pg',404);
    const Pg = await pgModel.findById(req.params.id);
    res.render('Pg/view',{Pg});
}))

app.get('/home/:id/edit',catchAsync(async(req,res)=>{
    const Pg = await pgModel.findById(req.params.id);
    res.render('Pg/edit',{ Pg });
}))

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

app.put('/home/:id',catchAsync(async (req,res)=>{
    const { id } = req.params;
    const Pg = await pgModel.findByIdAndUpdate(id,{...req.body.pg});
    res.redirect(`/home/${id}`);
}))

app.delete('/home/:id',catchAsync(async (req,res)=>{
    const { id } = req.params;
    await pgModel.findByIdAndDelete(id);
    res.redirect('/home');
}))

app.all('*',(req,res,next)=>{
    next(new ExpresError('Page Not Found',404))
})

//ExpressErrorHandler
app.use((err, req, res,next)=>{
    const {statusCode = 500} = err;
    if(!err.mesage) err.message = 'Something went wrong';
    res.status(statusCode).render('Error' , {err})
})


app.listen(3000,()=>{
    console.log("App Stated");
})