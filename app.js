import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";
import passport from "passport";
import Strategy from "passport-local";
import session from "express-session"
import GithubStrategy from "passport-github";

const app = express();
const port = 3000;
const saltRound = 10;
env.config();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
    }));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
    user: process.env.POSTGRES_USER,
    port: process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD
});
db.connect();

app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("Dashboard.ejs", {user: req.user});
    } else {
        res.redirect("/login");
    }
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        } else {
            res.redirect("/login")
        }
    })
})

app.post("/login", passport.authenticate(
    "local", {
        successRedirect: "/",
        failureRedirect: "/login"
    }
));

app.get("/auth/github", passport.authenticate("Github", {
    scope: ["user:email"]
}));

app.get("/api/auth/callback/github", passport.authenticate("Github", {
    successRedirect: "/",
    failureRedirect: "/login",
}));

app.get("/auth/google/callback", passport.authenticate("Google", {
    successRedirect: "/",
    failureRedirect: "/logon",
}));

app.get("/auth/google", passport.authenticate("Google"))

app.post("/register", async (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const planTextPassword = req.body.password

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length > 0) {
            res.redirect("/login")
        } else {
            bcrypt.hash(planTextPassword, saltRound, async (err, hash) => {
                if (err) {
                    console.log(err);
                } else {
                    const result = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING * ", [name, email, hash]);
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        console.log("success");
                        res.redirect("/")
                    });
                }
            });
        }

    } catch (err) {
        console.log(err)
    }
    console.log(`Name : ${name}, Email : ${email}, Password : ${planTextPassword}`)
});

passport.use(
    "local",
    new Strategy({usernameField: 'email'}, async function verify(email, password, cb) {
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

            if (result.rows.length > 0) {
                const user = result.rows[0];
                const hashedPassword = user.password;

                bcrypt.compare(password, hashedPassword, (err, valid) => {
                    if (err) {
                        return cb(err);
                    } else {
                        if (valid) {
                            return cb(null, user);
                        } else {
                            return cb(null, false); // Authentication failed
                        }
                    }
                });
            } else {
                // CHANGED: Pass null for error, false for user
                return cb(null, false);
            }
        } catch (err) {
            // This is for database connection errors
            return cb(err);
        }
    }),
);

passport.use(
    "Github",
    new GithubStrategy({
            clientID: process.env.GITGUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/api/auth/callback/github",
            userProfileURL: "https://api.github.com/user",
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const email = profile._json.email;
                const name = profile._json.name;

                console.log(`Name : ${name}, Email : ${email}`);

                const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
                if (result.rows.length === 0) {
                    const newUser = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING  *", [name, email, "Github"]);
                    return cb(null, newUser.rows[0]);
                } else {
                    return cb(null, result.rows[0]);
                }
            } catch (err) {
                return cb(err);
            }
        }));

passport.use("Google", new GithubStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
        },
        async (accessToken, refreshToken, profile, cb) => {
            const email = profile.email;

            try {
                const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

                if (result.rows.length === 0) {
                    const newUser = await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, "Google"]);
                    return cb(null, newUser.rows[0]);
                } else {
                    return cb(null, result.rows[0]);
                }
            } catch (err) {
                return cb(err)
            }
        }
    )
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
})

app.listen(port, () => {
    console.log(`Express Server is Listening on ${port}`);
});
