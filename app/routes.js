module.exports = function(app, passport) {
    // Home page
    app.get('/', function(req, res) {
        res.render('index.ejs', {
            user: req.user
        });
    });

    // Login page
    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // Process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    // Signup page
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // Process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    // Profile page
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user: req.user
        });
    });

    // Logout
    app.get('/logout', async function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =============================================================================
    // OAUTH =======================================================================
    // =============================================================================
    
    // Google | Authenticate the user
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    
    // Google | Callback
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // Discord | Authenticate the user
    app.get('/auth/discord', passport.authenticate('discord'));
    
    // Discord | Callback
    app.get('/auth/discord/callback', passport.authenticate('discord', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // GitHub | Authenticate the user
    app.get('/auth/github', passport.authenticate('github'));
    
    // GitHub | Callback
    app.get('/auth/github/callback', passport.authenticate('github', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // Google
    app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

    app.get('/connect/google/callback', passport.authorize('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // Discord
    app.get('/connect/discord', passport.authorize('discord'));

    app.get('/connect/discord/callback', passport.authorize('discord', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // GitHub
    app.get('/connect/github', passport.authorize('github'));

    app.get('/connect/github/callback', passport.authorize('github', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================

    // Google
    app.get('/unlink/google', function(req, res) {
        const user = req.user;
        user.google.id = undefined;
        user.google.name = undefined;
        user.google.email = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });

    // Discord
    app.get('/unlink/discord', function(req, res) {
        const user = req.user;
        user.discord.id = undefined;
        user.discord.email = undefined;
        user.discord.username = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });

    // GitHub
    app.get('/unlink/github', function(req, res) {
        const user = req.user;
        user.github.id = undefined;
        user.github.username = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });
};

// Make sure the user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}

// Make sure the user is logged out
function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/');
}