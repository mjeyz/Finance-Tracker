import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";
import passport from "passport";
import Strategy from "passport-local";
import session from "express-session";
import GithubStrategy from "passport-github";
import GoogleStrategy from "passport-google-oauth20";
import FacebookStrategy from "passport-facebook";
import nodemailer from "nodemailer";
import flash from "connect-flash";
import crypto from "crypto";
import rateLimit from "express-rate-limit";


const app = express();
const saltRound = 10;
const envResult = env.config();
const port = process.env.PORT || 3000;

if (envResult.error) {
    console.error("Unable to load .env:", envResult.error.message);
}

function getMissingEnvVars(keys) {
    return keys.filter((key) => !process.env[key] || process.env[key].trim() === "");
}

function printDbConnectionErrorDetails(err) {
    console.error("Connection error:", err?.message || "Unknown error");

    if (Array.isArray(err?.errors) && err.errors.length > 0) {
        console.error("Underlying connection attempts:");
        for (const innerErr of err.errors) {
            console.error(
                `- ${innerErr.code || "UNKNOWN"} ${innerErr.address || "unknown-host"}:${innerErr.port || "?"} (${innerErr.message || "no message"})`
            );
        }
    }
}

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
app.use(express.json())
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.info = req.flash("info");
    next();
});

const db = new pg.Client({
    user: process.env.POSTGRES_USER,
    port: Number(process.env.POSTGRES_PORT || 5432),
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD
});

db.on("error", (err) => {
    console.error("PostgreSQL client error:", err.message);
});


async function ensureOtpSchema() {
    try {
        await db.query(`
            ALTER TABLE users
                ADD COLUMN IF NOT EXISTS otp TEXT,
                ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP,
                ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE
        `);

        const schemaResult = await db.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
              AND column_name IN ('otp', 'otp_expiry')
        `);

        const columnTypes = Object.fromEntries(
            schemaResult.rows.map((row) => [row.column_name, row.data_type])
        );

        if (columnTypes.otp && columnTypes.otp !== "text") {
            await db.query(`ALTER TABLE users ALTER COLUMN otp TYPE TEXT USING otp::text`);
        }

        if (columnTypes.otp_expiry && columnTypes.otp_expiry !== "timestamp without time zone") {
            if (columnTypes.otp_expiry === "time without time zone") {
                await db.query(`
                    ALTER TABLE users
                    ALTER
                    COLUMN otp_expiry TYPE TIMESTAMP
                    USING CASE
                        WHEN otp_expiry IS NULL THEN NULL
                        ELSE CURRENT_DATE + otp_expiry
                    END
                `);
            } else {
                await db.query(`ALTER TABLE users ALTER COLUMN otp_expiry TYPE TIMESTAMP USING otp_expiry::timestamp`);
            }
        }
    } catch (err) {
        console.log("OTP schema initialization error:", err);
    }
}


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || process.env.SMATP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP connection error : ", error);
    } else {
        console.log("SMTP server is ready to send message");
    }
});

const sendOtpLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: {success: false, error: "Too many OTP requests. Try again later."},
    standardHeaders: true,
    legacyHeaders: false
});

const verifyOtpLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {success: false, error: 'Too many verification attempts. Try again later.'},
});

function hashOtp(otp) {
    return crypto.createHash("sha256").update(otp.toString()).digest("hex");
}

app.get("/", async (req, res) => {
    if (req.isAuthenticated()) {

        try {
            const user_id = req.user.id;

            const transactionResult = await db.query("SELECT * FROM transaction WHERE user_id = $1 ORDER BY id DESC", [user_id]);
            const eventResult = await db.query("SELECT * FROM events WHERE user_id = $1", [user_id]);
            const savingResult = await db.query("SELECT * FROM saving WHERE user_id = $1", [user_id]);


            const transaction = transactionResult.rows;
            const events = eventResult.rows;


            const saving = savingResult.rows

            res.render("Dashboard.ejs", {user: req.user, transaction: transaction, events: events, saving: saving});
        } catch (err) {
            console.log(err)
        }
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

app.get("/change-password", (req, res) => {
    res.render("change-password.ejs");
});

app.get("/varify-email", (req, res) => {
    res.render("varify-email.ejs");
});

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            req.flash("error", "Unable to log out right now.");
            return res.redirect("/");
        }

        req.flash("success", "You have been logged out.");
        res.redirect("/login");
    });
});

app.get("/auth/github", passport.authenticate("Github", {
    scope: ["user:email"]
}));

app.get("/auth/google", passport.authenticate("Google", {
    scope: ["profile", "email"]
}));

app.get("/auth/facebook", passport.authenticate("Facebook", {
    scope: ["public_profile", "email"]
}));

app.get("/api/auth/callback/github", passport.authenticate("Github", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Logged in with GitHub."
}));

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome back!"
}));

app.get("/auth/google/callback", passport.authenticate("Google", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Logged in with Google."
}));

app.get("/auth/facebook/callback", passport.authenticate("Facebook", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Logged in with Facebook."
}));

app.post("/register", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const plainTextPassword = req.body.password;

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length > 0) {
            req.flash("error", "An account with that email already exists. Login Instead");
            return res.redirect("/login");
        }

        bcrypt.hash(plainTextPassword, saltRound, async (err, hash) => {
            if (err) {
                console.log(err);
                req.flash("error", "We could not create your account right now.");
                return res.redirect("/register");
            }

            const result = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [name, email, hash]);
            const user = result.rows[0];

            req.login(user, (loginErr) => {
                if (loginErr) {
                    console.log(loginErr);
                    req.flash("error", "Account created, but login failed.");
                    return res.redirect("/login");
                }

                req.flash("success", "Account created successfully.");
                res.redirect("/");
            });
        });
    } catch (err) {
        console.log(err);
        req.flash("error", "Unable to register right now.");
        res.redirect("/register");
    }

    console.log(`Name : ${name}, Email : ${email}, Password : ${plainTextPassword}`);
});

passport.use(
    "local",
    new Strategy({usernameField: "email"}, async function verify(email, password, cb) {
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

            if (result.rows.length === 0) {
                return cb(null, false, {message: "Incorrect email or password."});
            }

            const user = result.rows[0];
            const hashedPassword = user.password;

            bcrypt.compare(password, hashedPassword, (err, valid) => {
                if (err) {
                    return cb(err);
                }

                if (valid) {
                    return cb(null, user);
                }

                return cb(null, false, {message: "Incorrect email or password."});
            });
        } catch (err) {
            return cb(err);
        }
    })
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
                    const newUser = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [name, email, "Github"]);
                    return cb(null, newUser.rows[0]);
                }

                return cb(null, result.rows[0]);
            } catch (err) {
                return cb(err);
            }
        }
    )
);

passport.use(
    "Google",
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
        },
        async (accessToken, refreshToken, profile, cb) => {
            const email = profile.emails[0].value;
            const name = profile.displayName || profile.name?.givenName || "Google User";

            console.log("Email : ", email, "Name : ", name);
            console.log(profile);

            try {
                const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

                if (result.rows.length === 0) {
                    const newUser = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [name, email, "Google"]);
                    return cb(null, newUser.rows[0]);
                }

                return cb(null, result.rows[0]);
            } catch (err) {
                return cb(err);
            }
        }
    )
);

passport.use(
    "Facebook",
    new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_SECRET,
            callbackURL: "http://localhost:3000/auth/facebook/callback",
            profileFields: ["id", "displayName", "photos", "email"]
        },
        async (accessToken, refreshToken, profile, cb) => {
            const email = profile.emails[0].value;
            const name = profile.displayName;

            console.log("Email: ", email, "Name : ", name);
            console.log(profile);

            try {
                const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

                if (result.rows.length === 0) {
                    const newUser = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [name, email, "Facebook"]);
                    return cb(null, newUser.rows[0]);
                }

                return cb(null, result.rows[0]);
            } catch (err) {
                return cb(err);
            }
        }));

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.post("/change-password", async (req, res) => {
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    const email = req.body.email;

    if (newPassword !== confirmPassword) {
        req.flash("error", "Passwords do not match.");
        return res.redirect("/change-password");
    }

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            req.flash("error", "No account found for that email.");
            return res.redirect("/change-password");
        }

        bcrypt.hash(newPassword, saltRound, async (err, hash) => {
            if (err) {
                console.log(err);
                req.flash("error", "Unable to update password right now.");
                return res.redirect("/change-password");
            }

            await db.query("UPDATE users SET password = $1 WHERE email = $2", [hash, email]);
            console.log("Successfully Updated Password");
            req.flash("success", "Successfully Updated Password");
            res.redirect("/login");
        });
    } catch (err) {
        console.log(err);
        req.flash("error", "Unable to update password right now.");
        res.redirect("/change-password");
    }
});


app.post("/send-otp", sendOtpLimiter, async (req, res) => {
    try {
        const {email} = req.body;
        if (!email) {
            req.flash("error", "Please enter your email address.");
            return res.status(400).json({success: false, error: "Email is required."});
        }

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            req.flash("error", "Email does not exist. Please sign in first.")
            return res.status(404).json({success: false, error: "Email does not exist."});
        }

        const name = result.rows[0].name;
        const otp = crypto.randomInt(100000, 999999);
        const hashedOtp = hashOtp(otp);

        await db.query("UPDATE users SET otp = $1, otp_expiry = NOW() + INTERVAL '10 minutes' WHERE email = $2", [hashedOtp, email])


        const html = `
      <p>Hey ${name}!</p>
      <p>A sign‑in or password change attempt requires further verification because we did not recognize your identity. 
         To verify your identity, enter the verification code below:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This code expires in 10 minutes.</p>
      <p>Thanks,<br/>The FinTrack Team</p>
    `;

        const info = await transporter.sendMail({
            from: `"FinTrack" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "[FinTrack] Please verifying your identity",
            text: `Your Privacy is our First concern`,
            html: html || `<p>Your single code is : ${otp} don't share it with anyone.</p>`
        });

        req.flash("success", `Email sent : ${info.messageId}`);
        console.log(`Email sent : ${info.messageId}`);
        res.json({success: true, messageId: info.messageId});
    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({success: false, error: err.message});
    }
});

app.post("/varify-email", verifyOtpLimiter, async (req, res) => {
    try {
        const {email, code} = req.body;

        if (!email || !code) {
            req.flash("error", "Email and verification code are required.");
            return res.redirect("/varify-email");
        }

        const result = await db.query("SELECT otp, otp_expiry FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            req.flash("error", "User not found.");
            return res.redirect("/varify-email");
        }

        const {otp: storedHashedOtp, otp_expiry} = result.rows[0];

        if (!storedHashedOtp) {
            req.flash("error", "No OTP requested. Please request a new code.");
            return res.redirect("/varify-email");
        }
        if (!otp_expiry || new Date() > new Date(otp_expiry)) {
            req.flash("error", "OTP has expired. Please request a new one.");
            return res.redirect("/varify-email");
        }

        const hashedInput = hashOtp(code);
        if (hashedInput !== storedHashedOtp) {
            req.flash("error", "Invalid verification code");
            return res.redirect("/varify-email");
        }

        await db.query(
            "UPDATE users SET otp = NULL, otp_expiry = NULL, is_verified = TRUE WHERE email = $1",
            [email]
        );

        req.flash("success", "Email verified successfully!");
        res.redirect("/login");
    } catch (err) {
        console.log(err);
        req.flash("error", "Unable to verify your email right now.");
        res.redirect("/varify-email");
    }
});

app.get("/add-transaction", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("create-transaction.ejs", {is_edit: false, transaction: ""});
    } else {
        res.redirect("/login");
    }
});

app.get("/add-saving", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("create-saving.ejs", {is_edit: false, goal: ""});
    } else {
        res.redirect("/login");
    }
});

app.get("/add-event", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("create-event.ejs", {is_edit: false, event: ""});
    } else {
        res.redirect("/login");
    }
});


app.post("/add-transaction", async (req, res) => {
    try {
        if (!req.user?.id) {
            req.flash("error", "Please log in again.");
            return res.status(401).json({success: false, error: "Please log in again."});
        }

        const {amount, transactionCategory, type, date, method, description} = req.body;

        console.log(`Category :  ${transactionCategory}`);
        if (!amount || !type) {
            req.flash("error", "Amount and type are required.");
            return res.status(400).json({success: false, error: "Amount and type are required."});
        }

        await db.query(
            "INSERT INTO transaction (user_id, amount, category, type, date, method, description) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [req.user.id, amount, transactionCategory, type, date || null, method || null, description || null]
        );

        req.flash("success", "Transaction added successfully.");
        if (req.is("application/json")) {
            return res.status(201).json({success: true});
        }
        res.redirect("/transaction")
    } catch (err) {
        console.log("Add transaction error:", err);
        req.flash("error", "Unable to save transaction right now.");


        if (req.is("application/json")) {
            return res.status(500).json({success: false, error: "Unable to save transaction right now."});
        }
        return res.redirect("/add-transaction");
    }

});

app.post("/add-event", async (req, res) => {
    try {
        if (!req.user?.id) {
            req.flash("error", "Please log in again.");
            return res.status(401).json({success: false, error: "Please log in again."});
        }

        const {eventName, location, eventDate, eventTime, priority, description} = req.body;

        if (!eventName) {
            req.flash("error", "Event name is required.");
            return res.status(400).json({success: false, error: "Event name is required."});
        }

        await db.query(
            "INSERT INTO events (user_id, name, location, date, time, priority, description) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [req.user.id, eventName, location || null, eventDate || null, eventTime, priority, description]
        );

        req.flash("success", "Event added successfully.");

        if (req.is("application/json")) {
            return res.status(201).json({success: true});
        }
        res.redirect("/events");
    } catch (err) {
        console.log("Add event error:", err);
        req.flash("error", "Unable to save event right now.");


        if (req.is("application/json")) {
            return res.status(500).json({success: false, error: "Unable to save event right now."});
        }
        return res.redirect("/add-event");

    }
});

app.post("/add-saving", async (req, res) => {
    try {
        if (!req.user?.id) {
            req.flash("error", "Please log in again.");
            if (req.is("application/json")) {
                return res.status(401).json({success: false, error: "Please log in again."});
            }

            return res.redirect("/login");
        }

        const {purpose, targetAmount, savedAmount, targetDate, description} = req.body;

        if (!purpose || !targetAmount) {
            req.flash("error", "Purpose and target amount are required.");
            if (req.is("application/json")) {
                return res.status(400).json({success: false, error: "Purpose and target amount are required."});
            }

            return res.redirect("/add-saving");
        }

        await db.query(
            "INSERT INTO saving (user_id, goal, targetAmount, savedAmount, date, description) VALUES ($1, $2, $3, $4, $5, $6)",
            [req.user.id, purpose, Number(targetAmount), savedAmount ? Number(savedAmount) : 0, targetDate, description]
        );

        req.flash("success", "Saving goal added successfully.");
        if (req.is("application/json")) {
            return res.status(201).json({success: true});
        }

        return res.redirect("/saving");
    } catch (err) {
        console.log("Add saving.ejs error:", err);
        req.flash("error", "Unable to save goal right now.");
        if (req.is("application/json")) {
            return res.status(500).json({success: false, error: "Unable to save goal right now."});
        }

        return res.redirect("/add-saving");
    }
});



app.get("/edit/transaction/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const id = req.params.id;
        const result = await db.query("SELECT * FROM transaction WHERE id = $1", [id]);
        const transaction = result.rows[0];

        const year = transaction.date.getFullYear();
        const month = String(transaction.date.getMonth() + 1).padStart(2, '0');
        const day = String(transaction.date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        res.render("create-transaction.ejs", {is_edit: true, transaction: transaction, formattedDate: formattedDate});
    } else {
        res.redirect("/login");
    }
});

app.get("/edit/event/:id", async (req, res) => {
    if(req.isAuthenticated()) {
        const id = req.params.id;

        const result = await db.query("SELECT * FROM events WHERE id = $1", [id]);
        const event = result.rows[0];
        console.log(event)

        const year = event.date.getFullYear();
        const month = String(event.date.getMonth() + 1).padStart(2, '0');
        const day = String(event.date.getDate()).padStart(2, "0");
        const formatedDate = `${year}-${month}-${day}`;
        res.render("create-event.ejs", {event: event, is_edit: true, formatedDate: formatedDate});
    } else {
        res.redirect("/login");
    }
});

app.get("/edit/goal/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const id = req.params.id;

        const result = await db.query("SELECT * FROM saving WHERE id = $1", [id]);
        console.log(result.rows)

        const goal = result.rows[0]
        // Convert to YYYY-MM-DD (respects local timezone)
        const year = goal.date.getFullYear();
        const month = String(goal.date.getMonth() + 1).padStart(2, '0');
        const day = String(goal.date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        console.log(formattedDate)

        res.render("create-saving.ejs", {is_edit: true, goal: goal, formattedDate: formattedDate});
    } else {
        res.redirect("/login");
    }
});

app.patch("/edit/transaction/:id", async (req, res) => {

});

app.patch("/edit/event/:id", async (req, res) => {

});

app.patch("/edit/goal/:id", async (req, res) => {
    const id = req.params.id;

    try {

    } catch (err) {
        console.log(`Error : ${err}`)
    }
});

app.post("/api/update/income", async (req, res) => {
    const {income, expense} = req.body;

    const result = await db.query("UPDATE users SET income = $1, expenses = $2 WHERE id = $3 RETURNING *", [Number(income), Number(expense), req.user.id]);

    req.user.income = Number(income);
    req.user.expenses = Number(expense);
    res.status(200).json({message: "Update successfully.", deleted: result.rows[0]});
    console.log(`Income : ${income}, Expense : ${expense}`);
})


app.delete('/api/transactions', async (req, res) => {
    const transactionId = req.query.id;

    if (!req.user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    try {
        const result = await db.query(
            "DELETE FROM transaction WHERE id = $1 AND user_id = $2 RETURNING *",
            [transactionId, req.user.id]
        );

        // If no rows were deleted, the ID doesn't exist or doesn't belong to the user
        if (result.rowCount === 0) {
            req.flash("error", 'Transaction not found or unauthorized');
            return res.status(404).json({error: 'Transaction not found or unauthorized'});
        }

        req.query("success", "Deleted successfully");
        res.status(200).json({message: 'Deleted successfully', deleted: result.rows[0]});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
});

app.delete("/api/delete/event", async (req, res) => {
    const transactionId = req.query.id;

    try {
        const result = await db.query("DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *", [transactionId, req.user.id]);
        req.flash("success", "Event deleted successfully");
        res.status(200).json({message: "Deleted successfully", deleted: result.rows[0]});
    } catch (err) {
        console.log(err);
    }
});

app.delete("/api/delete/goal", async (req, res) => {
    const goalId = req.query.id;

    try {
        const result = await db.query("DELETE FROM saving.ejs WHERE id = $1 AND user_id = $2 RETURNING *", [goalId, req.user.id]);
        req.flash("success", "Goal deleted successfully");
        res.status(200).json({message: "Deleted successfully", deleted: result.rows[0]});
    } catch (err) {
        console.log(err);
    }
})


app.get("/api/transaction/charts", async (req, res) => {
    try {
        const result = await db.query("SELECT  category, SUM(amount) AS total_amount FROM transaction WHERE user_id = $1 GROUP BY category ORDER BY total_amount DESC", [req.user.id])

        if (result.rowCount === 0) {
            return res.status(404).json({error: 'Transaction not found or unauthorized'});
        }
        res.json(result.rows)
    } catch (err) {
        console.error("Database error : ", err.message);
        res.status(500).send("Server Error.");
    }
});

app.get("/api/graph", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT TO_CHAR(date, 'Mon') AS month_label,
                    SUM(amount) ::FLOAT AS total
             FROM transaction
             WHERE user_id = $1
               AND type = 'expense'
               AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
             GROUP BY TO_CHAR(date, 'Mon')
             ORDER BY MIN(EXTRACT(MONTH FROM date));`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Server error"});
    }
});

app.get("/transaction", async (req, res) => {
    if (req.isAuthenticated()) {
        const result = await db.query("SELECT * FROM transaction WHERE user_id = $1 ORDER BY id DESC", [req.user.id])
        res.render("transactions.ejs", {user: req.user, transaction: result.rows})
    } else {
        res.redirect("login")
    }

});

app.get("/events", async (req, res) => {
    if (req.isAuthenticated()) {
        const result = await db.query("SELECT * FROM events WHERE user_id = $1 ORDER BY id DESC", [req.user.id])
        res.render("event.ejs", {user: req.user, events: result.rows})
    } else {
        res.redirect("login");
    }
});

app.get("/saving", async (req, res) => {
    if (req.isAuthenticated()) {
        const result = await db.query("SELECT * FROM saving WHERE user_id = $1 ORDER BY id DESC", [req.user.id])
        res.render("saving.ejs", {user: req.user, saving: result.rows})
    } else {
        res.redirect("/login");
    }
})


async function startServer() {
    try {
        const requiredDbEnv = [
            "POSTGRES_USER",
            "POSTGRES_HOST",
            "POSTGRES_PORT",
            "POSTGRES_DATABASE",
            "POSTGRES_PASSWORD"
        ];
        const missingDbEnv = getMissingEnvVars(requiredDbEnv);

        if (missingDbEnv.length > 0) {
            console.error("Missing required DB environment variables:", missingDbEnv.join(", "));
            process.exit(1);
        }

        await db.connect();
        console.log("Connected to PostgreSQL");

        await ensureOtpSchema();

        app.listen(port, () => {
            console.log(`Express Server is Listening on ${port}`);
        });
    } catch (err) {
        console.error("Failed to connect to PostgreSQL.");
        console.error("Check that PostgreSQL is running and your .env DB settings are correct.");
        console.error("Expected host/port:", `${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}`);
        printDbConnectionErrorDetails(err);
        process.exit(1);
    }
}

startServer();


