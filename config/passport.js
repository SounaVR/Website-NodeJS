const { passwordStrength } = require('check-password-strength');
const LocalStrategy = require('passport-local').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../app/models/user');

module.exports = (passport) => {
    // "Connect" the user
    passport.serializeUser(function (user, done) {
        done(null, user.id)
    });
    
    // "Disconnect" the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // Local signup (email & password)
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        process.nextTick(() => {
            if (!req.user) {
                User.findOne({ 'local.email': email }, (err, user) => {
                    if (err) return done(err);
    
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        if (passwordStrength(password).id < 2) {
                            return done(null, false, req.flash('signupMessage', 'Your password is too weak.'), req.flash('email', email), req.flash('password', password));
                        }
                        const newUser = new User();
    
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
    
                        newUser.save((err) => {
                            if (err) throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                const user = req.user;

                user.local.email = email;
                user.local.password = user.generateHash(password);

                user.save((err) => {
                    if (err) throw err;
                    return done(null, user);
                });
            }
        });
    }));

    // Local login (email & password)
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done) {
        User.findOne({ 'local.email' :  email }, (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));
            if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

            return done(null, user);
        });
    }));

    // Google login/signup
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://souna.xyz/node/auth/google/callback',
        passReqToCallback: true
    }, function(req, token, refreshToken, profile, done) {
        process.nextTick(() => {
            if (!req.user) {
                User.findOne({ 'google.id': profile.id }, (err, user) => {
                    if (err) return done(err);

                    if (user) {
                        if (!user.google.id) {
                            user.google.id = profile.id;
                            user.google.name = profile.displayName;
                            user.google.email = profile.emails[0].value;
    
                            user.save((err) => {
                                if (err) throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        const newUser = new User();
    
                        newUser.google.id = profile.id;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;
    
                        newUser.save((err) => {
                            if (err) throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                const user = req.user;

                user.google.id = profile.id;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value;

                user.save((err) => {
                    if (err) throw err;
                    return done(null, user);
                });
            }
        });
    }));

    // Discord login/signup
    let scopes = ['identify', 'email'];
    passport.use(new DiscordStrategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: 'https://souna.xyz/node/auth/discord/callback',
        passReqToCallback: true,
        scope: scopes
    }, function(req, accessToken, refreshToken, profile, done) {
        process.nextTick(() => {
            if (!req.user) {
                User.findOne({ 'discord.id': profile.id }, (err, user) => {
                    if (err) return done(err);
                    if (user) {
                        if (!user.discord.id) {
                            user.discord.id = profile.id;
                            user.discord.username = profile.username + '#' + profile.discriminator;
                            user.discord.email = profile.email;

                            user.save(function(err) {
                                if (err) throw err;
                                return done(null, user);
                            });
                        }
                        
                        return done(null, user);
                    } else {
                        const newUser = new User();
    
                        newUser.discord.id = profile.id;
                        newUser.discord.username = profile.username + '#' + profile.discriminator;
                        newUser.discord.email = profile.email;
    
                        newUser.save((err) => {
                            if (err) throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                const user = req.user;

                user.discord.id = profile.id;
                user.discord.username = profile.username + '#' + profile.discriminator;
                user.discord.email = profile.email;

                user.save((err) => {
                    if (err) throw err;
                    return done(null, user);
                });
            }
        });
    }));

    // GitHub login/signup
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'https://souna.xyz/node/auth/github/callback',
        passReqToCallback: true
    }, function(req, token, refreshToken, profile, cb) {
        process.nextTick(() => {
            if (!req.user) {
                User.findOne({ 'github.id': profile.id }, (err, user) => {
                    if (err) return cb(err);
                    if (user) {
                        if (!user.github.id) {
                            user.github.id = profile.id;
                            user.github.username = profile.username;

                            user.save(function(err) {
                                if (err) throw err;
                                return done(null, user);
                            });
                        }
                        
                        return cb(null, user);
                    } else {
                        const newUser = new User();
    
                        newUser.github.id = profile.id;
                        newUser.github.username = profile.username;
    
                        newUser.save((err) => {
                            if (err) throw err;
                            return cb(null, newUser);
                        });
                    }
                });
            } else {
                const user = req.user;

                user.github.id = profile.id;
                user.github.username = profile.username;

                user.save((err) => {
                    if (err) throw err;
                    return cb(null, user);
                });
            }
        });
    }));
};