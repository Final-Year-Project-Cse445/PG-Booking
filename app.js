const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Joi  = require('joi');
const catchAsync = require('./ErrorHandlers/catchAsync');
const ExpressError = require('./ErrorHandlers/ExpressError');
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
const Review = require('./models/review');

const res = require('express/lib/response');
mongoose.connect('mongodb://localhost:27017/test01')
    .then(()=>{ console.log('Database Connected') })
    .catch((error)=>{ 
    console.log('Error in Connecting Databse');
    console.log(error);
})

//PGError_JOI_Validate Middleware_for_pgvalidation
const validatePg = (req,res,next)=>{
    const Pgvalidate = Joi.object({
        pg : Joi.object({
            title : Joi.string().required(),
            price : Joi.number().required().min(0), 
            image : Joi.string().required(),
            location : Joi.string().required(),
            description : Joi.string().required(),
            rating : Joi.number().required().max(5)
        }).required()
    })
    const { error } = Pgvalidate.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(',')
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

//JOI_Review Validation
const reviewvalidate = (req,res,next) => {
    const validatereview = Joi.object({
        review : Joi.object({
            body : Joi.string().required(),
            rating : Joi.number().min(1).max(5).required()
        }).required()
    })
    const { error } = validatereview.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(',')
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

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

app.post('/home/new',validatePg, catchAsync(async (req,res,next)=>{
    // if(!req.body.pg) throw new ExpresError('Invalid Pg Data',400);
        const Pg = new pgModel(req.body.pg);
        await Pg.save();
        res.redirect(`/home/${Pg._id}`);
}))

app.get('/home/:id', catchAsync(async (req,res)=>{
    if(!req.params.id) throw new ExpresError('Invalid Pg',404);
    const Pg = await pgModel.findById(req.params.id).populate('reviews');
    res.render('Pg/view',{Pg});
}))

app.post('/home/:id/reviews',reviewvalidate, catchAsync(async (req,res) =>{
    const pg = await pgModel.findById(req.params.id);
    const review = new Review(req.body.review);
    pg.reviews.push(review);
    await review.save();
    await pg.save();
    res.redirect(`/home/${pg._id}`);
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

app.delete('/home/:id/reviews/:reviewId',catchAsync(async (req,res)=>{
    const {id,reviewId} = req.params;
    await pgModel.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/home/${id}`);
    
}))


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

//ExpressErrorHandler
app.use((err, req, res,next)=>{
    const {statusCode = 500} = err;
    // console.log(err.mesage)
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('Error' , {err})
})


app.listen(3000,()=>{
    console.log("App Stated");
})