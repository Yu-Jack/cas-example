const path = require("path");
const express = require("express");
const app = express();
const session = require("express-session")
const bodyParser = require("body-parser");
const axios = require("axios");
const KEY = "54321"
const URL = "http://test.example2.com:5000/verify"

function getHmac(data) {
    return require("crypto").createHmac("sha256", KEY).update(data).digest("hex");
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
app.get('/', (req, res) => {
    res.render("ap2_index", {
        checksum: getHmac(URL),
        serviceUrl: URL
    })
})

app.get('/verify', async (req, res) => {
    const {
        ticket, checksum
    } = {...req.query}
    if (getHmac(ticket) !== checksum) {
        return res.redirect("/failed")
    }
    const response = await axios.post("http://test.cas-example.com:3000/verify", {
        ticket,
        checksum: getHmac(ticket),
    }).then((response) => response.data);
    if (response.status === 200) {
        req.session.login = true;
        return res.redirect("/manager");
    }
    res.redirect("/failed");
})

app.get('/manager', (req, res) => {
    if (!req.session.login) {
        return res.redirect("/failed");
    }
    res.render("ap2_manager")
});

app.get('/failed', (req, res) => {
    res.render("failed")
})
const port = 5000
app.listen(port, () => {
    console.log(`http://test.example2.com:${port}/`);
})