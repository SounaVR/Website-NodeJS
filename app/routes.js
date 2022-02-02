module.exports = function(app, passport) {
    // Home page
    app.get('//', function(req, res) {
        res.render('index.ejs', {
            user: req.user
        });
    });

    // Admin page
    app.get('//admin', isAdmin, function(req, res) {
        res.render('admin.ejs', {
            user: req.user
        });
    });

    // Login page
    app.get('//login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // Process the login form
    app.post('//login', passport.authenticate('local-login', {
        successRedirect: '/node/profile',
        failureRedirect: '/node/login',
        failureFlash: true
    }));

    // Signup page
    app.get('//signup', function(req, res) {
        res.render('signup.ejs', {
            message: req.flash('signupMessage'),
            // Keep the credentials in the form if there any errors (we don't need to rewrite our mail and password 😏)
            form_email: req.flash('email'),
            form_password: req.flash('password')
        });
    });

    // Process the signup form
    app.post('//signup', passport.authenticate('local-signup', {
        successRedirect: '/node/profile',
        failureRedirect: '/node/signup',
        failureFlash: true
    }));

    // Profile page
    app.get('//profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user: req.user
        });
    });
    
    // Change password page
    app.get('//changepw', isLoggedIn, function(req, res) {
        res.render('changepw.ejs', {
            message: req.flash('changePassword'),
            user: req.user
        });
    });

    // New password handlere
    app.post('//pw', isLoggedIn, function(req, res) {
        const User = require('./models/user'); // Get mongo functions
        const user = req.user;
        var uwu = true; // Boolean
        if (req.body.email === user.local.email) { // Check if the typed email = actual user email
            if (user.validPassword(req.body.oldPassword)) { // Check with bcrypt if the old = the actual one
                if (req.body.newPassword === req.body.confirmNewPassword) { // Check new = confirm
                    User.findOne({ 'local.email' :  req.body.email }, (err, user) => { // Select the user in the DB
                        user.local.password = user.generateHash(req.body.newPassword); // Hash the new password

                        user.save((err) => { // Save the user
                            if (err) throw err;
                        });
                        uwu = true; // Set the boolean to true (for the redirect)
                    });
                } else {
                    req.flash('changePassword', 'The confirmation is different.');
                    uwu = false;
                }
            } else {
                req.flash('changePassword', 'The provided password doesn\'t match with your actual.');
                uwu = false;
            }
        } else {
            req.flash('changePassword', 'It\'s not your email.');
            uwu = false;
        }

        if (uwu) {
            res.redirect('/node/profile');
        } else res.redirect('/node/changepw');
    });

    // Logout
    app.get('//logout', async function(req, res) {
        req.logout();
        res.redirect('/node');
    });

    // =============================================================================
    // OAUTH =======================================================================
    // =============================================================================
    
    // Google | Authenticate the user
    app.get('//auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    
    // Google | Callback
    app.get('//auth/google/callback', passport.authenticate('google', {
        successRedirect: '/node/profile',
        failureRedirect: '/node'
    }));

    // Discord | Authenticate the user
    app.get('//auth/discord', passport.authenticate('discord'));
    
    // Discord | Callback
    app.get('//auth/discord/callback', passport.authenticate('discord', {
        successRedirect: '/node/profile',
        failureRedirect: '/node'
    }));

    // GitHub | Authenticate the user
    app.get('//auth/github', passport.authenticate('github'));
    
    // GitHub | Callback
    app.get('//auth/github/callback', passport.authenticate('github', {
        successRedirect: '/node/profile',
        failureRedirect: '/node'
    }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // Google
    app.get('//connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

    app.get('//connect/google/callback', passport.authorize('google', {
        successRedirect: '/node/profile',
        failureRedirect: '/node'
    }));

    // Discord
    app.get('//connect/discord', passport.authorize('discord'));

    app.get('//connect/discord/callback', passport.authorize('discord', {
        successRedirect: '/node/profile',
        failureRedirect: '/node'
    }));

    // GitHub
    app.get('//connect/github', passport.authorize('github'));

    app.get('//connect/github/callback', passport.authorize('github', {
        successRedirect: '/node/profile',
        failureRedirect: '/node'
    }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================

    // Google
    app.get('//unlink/google', function(req, res) {
        const user = req.user;
        user.google.id = undefined;
        user.google.name = undefined;
        user.google.email = undefined;
        user.save(function() {
           res.redirect('/node/profile');
        });
    });

    // Discord
    app.get('//unlink/discord', function(req, res) {
        const user = req.user;
        user.discord.id = undefined;
        user.discord.email = undefined;
        user.discord.username = undefined;
        user.save(function() {
           res.redirect('/node/profile');
        });
    });

    // GitHub
    app.get('//unlink/github', function(req, res) {
        const user = req.user;
        user.github.id = undefined;
        user.github.username = undefined;
        user.save(function() {
           res.redirect('/node/profile');
        });
    });
};

// Make sure the user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/node');
}

// Make sure the user is logged out
function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/node');
}

// Make sure the user is admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && (req.user.admin === true)) {
        return next();
    }
    return res.redirect('/node');
}