import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";
import passport from "passport";
import Strategy from "passport-local";
import session from "express-session"

const app = express();
const port = 3000;
const saltRound = 10;
env.config();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
    }),
);

app.use(bodyParser.urlencoded({ extended: true }));
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
  res.render("Dashboard.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/login", passport.authenticate(
    "login", {
        successRedirect: "/",
        failureRedirect: "/login"
    }
));

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
                    const result= await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [name, email, hash]);
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
    new Strategy(async function verify(email, password, cb) {
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

            if (result.rows.length > 0) {
               const user = result[0];
               const hashedPassword = user.password;

               bcrypt.compare(password, hashedPassword, (err, valid) => {
                   if (err) {
                       console.log("Error Comparing password: ", err);
                       return cb(err);
                   } else {
                       if (valid) {
                           return cb(null, user);
                       } else {
                           return cb(null, false);
                       }
                   }
               })
            } else {
                return cb("User Not found");
            }
        } catch (err) {
            console.log(err)
        }
    }),
);

app.listen(port, () => {
    console.log(`Express Server is Listening on ${port}`);
});