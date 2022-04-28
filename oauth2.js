require("dotenv").config();

let {
    TwitterApi
} = require('twitter-api-v2');
var express = require("express");

const app = express();

let client_id = process.env.CLIENT_ID;
let client_secret = process.env.CLIENT_SECRET;
const callback = "http://localhost:9000/callback";
const scopes = ["tweet.write", "users.read", "tweet.read", "offline.access"];

// Create a partial client for auth links
let client = new TwitterApi({
    clientId: client_id,
    clientSecret: client_secret
});

let code_verifier = "";
let Token = {};

app.get("/start", async function (req, res) {
    const {
        url,
        codeVerifier
    } = client.generateOAuth2AuthLink(callback, {
        scope: scopes
    });

    code_verifier = codeVerifier;

    return res.status(200).json(url);
});

app.get("/callback", async function (req, res) {
    const {
        code
    } = req.query;
    let token = await client.loginWithOAuth2({
        code: code,
        codeVerifier: code_verifier,
        redirectUri: callback
    });

    Token = token;

    return res.status(200).json(token);
});

app.get("/profile", async function (req, res) {
    try {
        Token = await client.refreshOAuth2Token(Token.refreshToken);
        let partial_client = new TwitterApi(Token.accessToken);
        let profile = await partial_client.currentUserV2();

        return res.status(200).json(profile);
    } catch (error) {
        console.log(error)
    }

});

app.get("/revoke", async function (req, res) {
    Token = await client.refreshOAuth2Token(Token.refreshToken);
    await client.revokeOAuth2Token(Token.accessToken, "access_token")

    return res.status(200).json();
});

app.listen(9000, () => {
    console.log(`Go here to login: http://127.0.0.1:9000/start`);
});