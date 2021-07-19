require("dotenv").config();

var OAuth = require('oauth');
var express = require("express");

const app = express();

let consumer_key = process.env.CONSUMER_KEY;
let consumer_secret = process.env.CONSUMER_SECRET;

let requestToken = '';
let requestTokenSecret = '';
let accessToken = '';
let accessTokenSecret = '';

var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    consumer_key,
    consumer_secret,
    '1.0A',
    "http://localhost:3000/callback",
    'HMAC-SHA1'
);

// start oauth
app.post("/start", (req, res, next) => {
    oauth.getOAuthRequestToken((error, reqToken, reqTokenSecret) => {
        if (error) {
            return console.log(error)
        };

        requestToken = reqToken;
        requestTokenSecret = reqTokenSecret;

        const redirect = `https://twitter.com/oauth/authorize?oauth_token=${reqToken}`;

        return res.status(200).json(redirect);
    });
});

// oauth callback
app.get("/callback", (req, res, next) => {
    oauth.getOAuthAccessToken(req.query.oauth_token, requestTokenSecret, req.query.oauth_verifier, (error, accToken, accTokenSecret) => {
        if (error) {
            return console.log(error)
        };

        accessToken = accToken;
        accessTokenSecret = accTokenSecret;

        return res.status(200).json({
            accessToken,
            accessTokenSecret
        });

    });
});

// get users profile
app.get("/user", (req, res, next) => {
    oauth.get("https://api.twitter.com/1.1/account/verify_credentials.json", "accessToken", "accessTokenSecret", (e, data, respond) => {
        if (e) console.error(e);
        return res.status(200).json(data);
    });
})

// revoke
app.delete("/user", (req, res, next) => {
    oauth.post("https://api.twitter.com/1.1/oauth/invalidate_token", "accessToken", "accessTokenSecret", {}, "applicatoin/json", (e, data, respond) => {
        if (e) console.error(e);
        return res.status(200).json(data);
    })
})

app.listen(3000, console.log("Server running"));