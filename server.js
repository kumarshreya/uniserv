const express = require('express'); // Import Express
const app = express(); // Instantiate Express
const exphbs = require('express-handlebars');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const bcrypt = require('bcryptjs');
const session = require('express-session'); 
const bodyParser = require('body-parser')
const passport = require('passport'); // Authentication middleware
const LocalStrategy = require('passport-local').Strategy;
const flash = require('express-flash');


const mysql = require('mysql'); 
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,  // Environment variable. Start app like: 'DB_USER=app DB_PASS=test nodemond index.js' OR use .env
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const port = process.env.PORT || 8080;

app.use(express.static('public'));


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
app.engine('handlebars', exphbs()); //edited
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
    const user = req.user;
    if (user) {
        res.render('index',{loginStatus: 'Log Me Out'});
    } else {
        res.render('index',{loginStatus: 'Log Me In'});
    }
});

// Individual blog post

//
// ACCOUNT MANAGEMENT
//

app.get('/login', function (req, res) {
    const user = req.user;
    if (user) {
        // If we already have a user, don't let them see the login page, just send them to the admin!
        res.redirect('/');
    } else {
        res.render('login', { loginMessage: req.flash('loginMessage') })
    }
});

app.post('/login', 
    // In this case, invoke the local authentication strategy.
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

app.get('/register', function (req, res) {
    const user = req.user;
    if (user) {
        res.redirect('/');
    } else {
        res.render('register', { registerMessage: req.flash('registerMessage') })
    }
});

//This section is for all the dropdown items
app.get('/eyebrows', function (req, res) {
    const q = `SELECT * FROM server WHERE service='eyebrows' AND approved='y'`;
    db.query(q, function (err, results, fields) {
        if (err) {
            console.error(err);
        }
        const templateData = {
            providers: results
        };

        res.render('eyebrows', templateData);
    });  
});

app.get('/makeup', function (req, res) {
    const q = `SELECT * FROM server WHERE service='makeup' AND approved='y'`;
    db.query(q, function (err, results, fields) {
        if (err) {
            console.error(err);
        }
        const templateData = {
            providers: results
        };

        res.render('makeup', templateData);
    });  
});

app.get('/haircut', function (req, res) {
    const q = `SELECT * FROM server WHERE service='haircut' AND approved='y'`;
    db.query(q, function (err, results, fields) {
        if (err) {
            console.error(err);
        }
        const templateData = {
            providers: results
        };

        res.render('haircut', templateData);
    });  
});

app.get('/dj', function (req, res) {
    const q = `SELECT * FROM server WHERE service='dj' AND approved='y'`;
    db.query(q, function (err, results, fields) {
        if (err) {
            console.error(err);
        }
        const templateData = {
            providers: results
        };

        res.render('dj', templateData);
    });  
});

app.get('/mc', function (req, res) {
    const q = `SELECT * FROM server WHERE service='mc' AND approved='y'`;
    db.query(q, function (err, results, fields) {
        if (err) {
            console.error(err);
        }
        const templateData = {
            providers: results
        };

        res.render('mc', templateData);
    });  
});

app.get('/webdesign', function (req, res) {
    const q = `SELECT * FROM server WHERE service='web design' AND approved='y'`;
    db.query(q, function (err, results, fields) {
        if (err) {
            console.error(err);
        }
        const templateData = {
            providers: results
        };

        res.render('webdesign', templateData);
    });  
});

app.get('/graphicdesign', function (req, res) {
    const q = `SELECT * FROM server WHERE service='graphic design' AND approved='y'`;
    db.query(q, function (err, results, fields) {
        if (err) {
            console.error(err);
        }
        const templateData = {
            providers: results
        };

        res.render('graphicdesign', templateData);
    });  
});

app.get('/appdevelopment', function (req, res) {
    const q = `SELECT * FROM server WHERE service='app development' AND approved='y'`;
    db.query(q, function (err, results, fields) {
        if (err) {
            console.error(err);
        }
        const templateData = {
            providers: results
        };

        res.render('appdevelopment', templateData);
    });  
});

app.get('/photography', function (req, res) {
    const q = `SELECT * FROM server WHERE service='photography' AND approved='y'`;
    db.query(q, function (err, results, fields) {
        if (err) {
            console.error(err);
        }
        const templateData = {
            providers: results
        };

        res.render('photography', templateData);
    });  
});

app.post('/register', function (req, res) {
    const username = req.body.username;
    const pass = req.body.password;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const ruemail= req.body.ruemail;
    const category = req.body.category;
    const service = req.body.service;
    const servicebio = req.body.servicebio;
    const price = req.body.price;
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
                const q = `INSERT INTO server(serverid, username, hash, fname, lname, ruemail, category, service, servicebio, price) VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                db.query(q, [username, hash, fname, lname, ruemail, category, service, servicebio, price], function (err, results, fields) {
                    if (err) console.error(err);
                    req.flash('loginMessage', 'Account created successfully.');
                    res.redirect('/login');
                })
            })
        });
    })
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

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



