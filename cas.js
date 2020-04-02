const path = require("path");
const express = require("express");
const app = express();
const session = require("express-session")
const bodyParser = require("body-parser");

const KEYS = new Map();

KEYS.set("http://test.example1.com:4000/verify", "12345")
KEYS.set("http://test.example2.com:5000/verify", "54321")

const DB = new Map();

function getHmac(data, url) {
    return require("crypto").createHmac("sha256", KEYS.get(url)).update(data).digest("hex");
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))
app.get("/", (req, res) => {
    const {
        checksum,
        serviceUrl
    } = {...req.query}
    
    if (getHmac(serviceUrl, serviceUrl) !== checksum) {
        return res.render('error');
    }

    if (req.session.login) {
        if (req.session.userInfo.hasOwnProperty(serviceUrl)) {
            const ticket = req.session.userInfo[serviceUrl];
            return res.redirect(`${serviceUrl}?ticket=${ticket}&checksum=${getHmac(ticket, serviceUrl)}`)
        }

        const ticket = require("randomstring").generate(10);
        DB.set(ticket, serviceUrl);
        req.session.userInfo[serviceUrl] = ticket;
        return res.redirect(`${serviceUrl}?ticket=${ticket}&checksum=${getHmac(ticket, serviceUrl)}`)
    }

    req.session.login = false;
    res.render('index', {
        checksum,
        serviceUrl
    });
})
app.get("/error", (req, res) => {
    res.render('error');
})
app.get("/bad", (req, res) => {
    res.render('bad');
})
app.post("/login", (req, res) => {
    const {
        username,
        password
    } = {...req.body}

    const {
        checksum,
        serviceUrl
    } = {...req.query}
    if (getHmac(serviceUrl, serviceUrl) !== checksum) {
        return res.render('error');
    }

    if (username !== "123" && password !== "123") {
        return res.redirect("/bad")
    }
    req.session.login = true;
    req.session.userInfo = {};
    const ticket = require("randomstring").generate(10);
    DB.set(ticket, serviceUrl);
    req.session.userInfo[serviceUrl] = ticket;
    res.redirect(`${serviceUrl}?ticket=${ticket}&checksum=${getHmac(ticket, serviceUrl)}`)
});

app.post("/verify", (req, res) => {
    const {
        ticket,
        checksum
    } =  {...req.body}

    if (DB.has(ticket) === false)  {
        return res.json({staus: 100, msg: "wrong ticket"});
    }

    const serviceUrl = DB.get(ticket);
    if (getHmac(ticket, serviceUrl) !== checksum) {
        return res.json({status: 102, msg: "wrong checksum"});
    }

    res.json({
        status: 200,
        msg: "vetified"
    })
})

const port = 3000;
app.listen(port, () => {
    console.log("test1 data: http://test.example1.com:4000/");
    console.log("test2 data: http://test.example2.com:5000/");
})

