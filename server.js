const express = require('express'); // Import Express
const app = express(); // Instantiate Express

const mysql = require('mysql'); 
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,  // Environment variable. Start app like: 'DB_USER=app DB_PASS=test nodemond index.js' OR use .env
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const bcrypt = require('bcryptjs');
const session = require('express-session'); 
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars');  

app.use(express.static('public'));
const logger = require('./middleware/logger');
const passport = require('passport'); // Authentication middleware
const LocalStrategy = require('passport-local').Strategy;
const flash = require('express-flash');


app.use(logger.log);
const hbs = exphbs.create({
    helpers: {
        formatDate: function (date) {
            return moment(date).format('MMM DD, YYYY');
        }
    }
})

app.use(session({ 
    secret: 'ha8hWp,yoZF',  // random characters for secret
    cookie: { maxAge: 60000 }, // cookie expires after some time
    saveUninitialized: true,
    resave: true
}))

app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.engine('handlebars', hbs.engine); //edited
app.set('view engine', 'handlebars');

app.use(passport.initialize()); // Needed to use Passport at all
app.use(passport.session()); // Needed to allow for persistent sessions with passport


passport.use(new LocalStrategy({
        passReqToCallback: true // Passes req to the callback function, so we can put messages there if needed
    },
    function (req, username, password, done) {
        // Find the user based off their username
        const q = `SELECT * FROM server WHERE username = ?;`
        db.query(q, [username], function (err, results, fields) {
            if (err) return done(err);

            // User, if it exists, will be the first row returned
            // There should also only _be_ one row, provided usernames are unique in the app (and they should be!)
            const user = results[0]

            // 'done' here is looking for the following arguments: error, user, and a message or callback
            if (!user) {
                return done(null, false, req.flash('loginMessage', 'User not found')); // req.flash stores a temporary key/value
            }

            // User exists, check password against hash
            const userHash = user.hash; // Grab the hash of the user
            // Hash and compare the provided password with the stored hash.
            // This is an async function, so we have to use a callback to receive the results and continue
            bcrypt.compare(password, userHash, function(err, matches) {
                if (!matches) {
                    return done(null, false, req.flash('loginMessage', 'Incorrect username and/or password'));
                }
                // Otherwise, they match -- success! -- send passport the user (see: serializeUser)
                return done(null, user);
            });
        })
    }
))

// Tells passport what information to include in the session
// This will be run after authentication
// Just need ID for lookup later
passport.serializeUser(function(user, done) {
    done(null, user.serverid);
});

// Tells passport how to get user from information in session
// This will run on every request for which session data exists in a cookie.
passport.deserializeUser(function(serverid, done) {
    const q = `SELECT * FROM server WHERE serverid = ?;`
    db.query(q, [serverid], function (err, results, fields) {
        done(err, results[0]) // results[0] will be stored _in req.user_ for use in later middleware
    });
})


/************************
*        ROUTES         *
*************************/

// Homepage
app.get('/', function(req, res){
    res.sendFile(__dirname + '/uniserv2.html');
});

// Individual blog post

//
// ACCOUNT MANAGEMENT
//

app.get('/login', function (req, res) {
    const user = req.user;
    if (user) {
        // If we already have a user, don't let them see the login page, just send them to the admin!
        res.redirect('/admin');
    } else {
        res.render('login', { loginMessage: req.flash('loginMessage') })
    }
});

app.post('/login', 
    // In this case, invoke the local authentication strategy.
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })
);

app.get('/register', function (req, res) {
    const user = req.user;
    if (user) {
        res.redirect('/admin');
    } else {
        res.render('register', { registerMessage: req.flash('registerMessage') })
    }
});

app.post('/register', function (req, res) {
    const username = req.body.username;
    const pass = req.body.password;
    if (!username || !pass) {
        req.flash('registerMessage', 'Username and password are required.')
        return res.redirect('/register');
    }
    // Check if user exists, first
    const checkExists = `SELECT * FROM server WHERE username = ?`
    db.query(checkExists, [username], function (err, results, fields) {
        if (err) {
            console.error(err);
            return res.status(500).send('Something bad happened...'); // Important: Don't execute other code
        }
        if (results[0]) {
            req.flash('registerMessage', 'That username is already taken.');
            return res.redirect('/register');
        }
        // Otherwise, user doesn't exist yet, let's create them!
        
        // Generate salt and pass for the user
        bcrypt.genSalt(10, function (err, salt) {
            if (err) throw err;
            bcrypt.hash(pass, salt, function (err, hash) {
                if (err) throw err;
                // Add user to database with username and hash
                const q = `INSERT INTO server(serverid, username, hash) VALUES (null, ?, ?)`;
                db.query(q, [username, hash], function (err, results, fields) {
                    if (err) console.error(err);
                    req.flash('registerMessage', 'Account created successfully.');
                    res.redirect('/register');
                })
            })
        });
    })
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

//
// Logged In Functionality
//
// All arguments after the route path ('/admin') are middleware – we can actually have multiple defined for one route!
app.get('/admin', requireLoggedIn, function (req, res) {
    const user = req.user;
    res.render('admin', { user: user, adminMessage: req.flash.adminMessage } )
});

function requireLoggedIn(req, res, next) {
    const user = req.user;
    if (!user) {
        return res.status(401).redirect('/login')
    }
    next();
}

// 404 handler
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!");
});

// Listen in on a port to handle requests
const listener = app.listen(process.env.PORT || 3306, function () {
    console.log(`UNISERV APP listening on port ${listener.address().port}`);
});




/*$("[id^='browse']").on('click', function () {
    $("#mainer").hide();
    
})*/


/*$("#logbtn").on('click', function () {
    $("#mainer").hide();
})*/



