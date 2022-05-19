if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Joi = require("joi");
const catchAsync = require("./ErrorHandlers/catchAsync");
const ExpressError = require("./ErrorHandlers/ExpressError");
const flash = require("connect-flash");
const passport = require("passport");
const { storage, cloudinary } = require("./Cloudinary");
// const Cloudinary = require('cloudinary').v2;
const LocalStrategy = require("passport-local");
const multer = require("multer");
const upload = multer({ storage });
const { isLoggedIn } = require("./middleware");
const User = require("./models/user");
const path = require("path");
const app = express();

//sessionfiles
const session = require("express-session");
const sessionconfig = {
  secret: "thisisthedummysecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionconfig));
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine("ejs", ejsMate);

//passport authorization middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash_middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const pg = await pgModel.findById(id);
  if (!pg.author.equals(req.user._id)) {
    req.flash("error", "Permission denied");
    return res.redirect(`/home/${id}`);
  }
  next();
};

//to parse the body of post requests.
app.use(express.urlencoded({ extended: true }));

//to overide and use method like update and delete.
app.use(methodOverride("_method"));

//Database Connection Code.
const pgModel = require("./models/Pgmodel");
const Review = require("./models/review");

const res = require("express/lib/response");
const user = require("./models/user");
const Pgmodel = require("./models/Pgmodel");
mongoose
  .connect("mongodb://localhost:27017/test01")
  .then(() => {
    console.log("Database Connected");
  })
  .catch((error) => {
    console.log("Error in Connecting Databse");
    console.log(error);
  });

//PGError_JOI_Validate Middleware_for_pgvalidation
const validatePg = (req, res, next) => {
  const Pgvalidate = Joi.object({
    pg: Joi.object({
      title: Joi.string().required(),
      price: Joi.number().required().min(0),
      // image : Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
      rating: Joi.number().required().max(5),
      roomtype: Joi.number().required().max(4)
    }).required(),
    deleteImages: Joi.array(),
  });
  const { error } = Pgvalidate.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//JOI_Review Validation
const reviewvalidate = (req, res, next) => {
  const validatereview = Joi.object({
    review: Joi.object({
      body: Joi.string().required(),
      rating: Joi.number().min(1).max(5).required(),
    }).required(),
  });
  const { error } = validatereview.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//Routes
app.get("/", (req, res) => {
  res.render("Landing");
});
app.get("/single", async(req, res) => {
  const Pgs = await pgModel.find({roomtype: 1});
  res.render('Pg/show',{Pgs});
});
app.get("/double", async(req, res) => {
  const Pgs = await pgModel.find({roomtype: 2});
  res.render('Pg/show',{Pgs});
});

app.get('/Admincheck',async(req,res)=>{
  res.render("admin/check");
})

app.get('/Aupdate',async(req,res)=>{
  const Pgs = await pgModel.find({});
  res.render("Pg/Aupdate",{Pgs});
})

app.get('/Adelete',async(req,res)=>{
  const Pgs = await pgModel.find({});
  res.render("Pg/Adelete",{Pgs});
})

app.post('/admin',async(req,res)=>{
    const CODE = process.env.USER;
    const access = req.body.access;
    if(CODE == access){
      res.render('Pg/Admin');
    }else{
      const error = "Wrong Code, Try Again"
      res.render('admin/check',{error});
    }
})

app.get("/home", async (req, res) => {
  const Pgs = await pgModel.find({});
  res.render("Pg/index", { Pgs });
});
app.get("/index", async (req, res) => {
  // res.send("Hello");
  const Pgs = await pgModel.find({});
  res.render("Pg/index", { Pgs });
});
app.get("/home/new", isLoggedIn, (req, res) => {
  res.render("Pg/new");
});

app.get("/home/show", async (req, res) => {
  const Pgs = await pgModel.find({});
  res.render("Pg/show", { Pgs });
});

app.post("/home_search", async (req, res) => {
  let { price_range, Room_size, raiting } = req.body;
  price_range = parseInt(price_range);
  raiting = parseInt(raiting);
  Room_size = parseInt(Room_size);
  const Pgs = await pgModel.find({
    $and: [{ price: { $gte: price_range }},{rating :{$gte:raiting}},{roomtype:Room_size}]
  });
  // // const queryone = await pgModel.find({$cond:{if : }})
  // const {price,Category,location} = req.body
  // console.log(req.body);
  // console.log(pgs);
  // res.locals.isSearch = true;
  res.render('Pg/show',{Pgs});
});

app.post(
  "/home/new",
  isLoggedIn,
  upload.array("pg[image]"),
  validatePg,
  catchAsync(async (req, res, next) => {
    // if(!req.body.pg) throw new ExpresError('Invalid Pg Data',400);
    const Pg = new pgModel(req.body.pg);
    Pg.image = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    Pg.author = req.user._id;
    await Pg.save();
    // console.log(Pg);
    req.flash("success", "Successfully Created a new PG");
    res.redirect(`/home/${Pg._id}`);
  })
);

// app.post('/home/new',upload.single('pg[image]'), (req, res)=>{
//     res.send(req.body,req.file);
// })

app.get(
  "/home/:id",
  catchAsync(async (req, res) => {
    // if(!req.params.id) throw new ExpresError('Invalid Pg',404);
    const Pg = await pgModel
      .findById(req.params.id)
      .populate("reviews")
      .populate("author");
    if (!Pg) {
      req.flash("error", "Invalid Pg Request");
      return res.redirect("/home");
    }
    // console.log(Pg);
    res.render("Pg/view", { Pg });
  })
);

app.post(
  "/home/:id/reviews",
  isLoggedIn,
  reviewvalidate,
  catchAsync(async (req, res) => {
    const pg = await pgModel.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    pg.reviews.push(review);
    await review.save();
    await pg.save();
    req.flash("success", "Review Added successfully");
    res.redirect(`/home/${pg._id}`);
  })
);

app.get(
  "/home/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const Pg = await pgModel.findById(req.params.id);
    // const pg = await pgmodel.findById(id);
    if (!Pg) {
      req.flash("error", "Invalid Pg Request");
      return res.redirect("/home");
    }
    // if(!Pg.author.equals(req.user._id)){
    //     req.flash('error','Permission denied');
    //     return res.redirect(`/home/${id}`);
    // }
    res.render("Pg/edit", { Pg });
  })
);

//login Routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome Back");
    const redirecturl = req.session.returnto || "/home";
    delete req.session.returnto;
    res.redirect(redirecturl);
  }
);

//Register Routes
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err) => {
        req.flash("success", "Registered Successfully");
        res.redirect("/home");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
    // console.log(registeredUser);
    // res.redirect('/home');
  })
);

app.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Successfully Logout");
  res.redirect("/home");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/userGuide", (req, res) => {
  res.render("Guides/UserGuidelines");
});

app.put(
  "/home/:id",
  isLoggedIn,
  isAuthor,
  upload.array("pg[image]"),
  validatePg,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // const pg = await pgModel.findById(id);
    // if(!pg.author.equals(req.user._id)){
    //     req.flash('error','Permission denied');
    //     return res.redirect(`/home/${id}`);
    // }
    const Pg = await pgModel.findByIdAndUpdate(id, { ...req.body.pg });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    Pg.image.push(...imgs);
    await Pg.save();
    console.log(req.body.deleteImages);
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await Pg.updateOne({
        $pull: { image: { filename: { $in: req.body.deleteImages } } },
      });
    }
    req.flash("success", "Successfully Updated The Pg");
    res.redirect(`/home/${id}`);
  })
);

app.delete(
  "/home/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await pgModel.findByIdAndDelete(id);
    req.flash("success", "Deleted SuccessFully");
    res.redirect("/home");
  })
);

app.delete(
  "/home/:id/reviews/:reviewId",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await pgModel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted");
    res.redirect(`/home/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//ExpressErrorHandler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  // console.log(err.mesage)
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("Error", { err });
});

app.listen(3000, () => {
  console.log("App Stated");
});
