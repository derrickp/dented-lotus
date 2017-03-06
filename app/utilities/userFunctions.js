'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Boom = require("boom");
var sqliteUtilities_1 = require("./sqliteUtilities");
var config_1 = require("../config");
function verifyUniqueUser(req, res) {
    // Find an entry from the database that
    // matches the email
    sqliteUtilities_1.getUsers(req.payload.email).then(function (users) {
        if (users && users.length > 0) {
            var user = users[0];
            if (user) {
                if (user.email === req.payload.email) {
                    res(Boom.badRequest('Email taken'));
                    return;
                }
            }
        }
        // If everything checks out, send the payload through
        // to the route handler
        res(req.payload);
    });
}
exports.verifyUniqueUser = verifyUniqueUser;
function verifyGoogleId(token) {
    console.log("Checking google id token");
    return new Promise(function (resolve, reject) {
        var GoogleAuth = require('google-auth-library');
        var auth = new GoogleAuth;
        var client = new auth.OAuth2(config_1.GOOGLE_CLIENT_ID, '', '');
        client.verifyIdToken(token, config_1.GOOGLE_CLIENT_ID, 
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function (error, login) {
            if (error) {
                reject(error);
                return;
            }
            var payload = login.getPayload();
            console.log(payload.email);
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];
            resolve(payload.email);
        });
    });
}
function verifyCredentials(req, res) {
    var authPayload = req.payload;
    var authPromise;
    switch (authPayload.authType) {
        case "google":
            authPromise = verifyGoogleId(authPayload.auth_token);
            break;
        default:
            res(Boom.badRequest("Invalid authentication type"));
            return;
    }
    // Find an entry from the database that
    // matches either the email or username
    authPromise.then(function (email) {
        console.log("getting user by email");
        sqliteUtilities_1.getUsers(email).then(function (users) {
            if (users && users.length > 0) {
                var user = users[0];
                // If we have a user at this point, everything is good to go.
                // We've already verified their token previously.
                if (user) {
                    res(user);
                    return;
                }
                else {
                    res(Boom.badRequest('Incorrect username or email!'));
                }
            }
            else {
                res(Boom.badRequest('Incorrect username or email!'));
            }
        });
    }).catch(function (error) {
        res(Boom.badRequest(error.message));
    });
}
exports.verifyCredentials = verifyCredentials;
