import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("Dashboard.ejs");
});

app.get("/register", (req, res) => {
    res.render("login.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/register", (req, res) => {
});

app.post("/login", (req, res) => {
});

app.listen(port, () => {
    console.log(`Express Server is Listening on ${port}`);
});