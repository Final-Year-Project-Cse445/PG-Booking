module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){ 
        req.session.returnto = req.originalUrl;
        req.flash('error','You Must be Signed in First');
        return res.redirect('/login');
    }
    next();
}

