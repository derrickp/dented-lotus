'use strict';
var Boom = require("boom");
var sqliteUtilities_1 = require("./sqliteUtilities");
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
function verifyCredentials(req, res) {
    var password = req.payload.password;
    // Find an entry from the database that
    // matches either the email or username
    sqliteUtilities_1.getUsers(req.payload.email, true).then(function (users) {
        if (users && users.length > 0) {
            var user = users[0];
            if (user) {
                // !TODO! - Do a new compare with the id_token or something here. No storing passwords
                res(user);
            }
            else {
                res(Boom.badRequest('Incorrect username or email!'));
            }
        }
        else {
            res(Boom.badRequest('Incorrect username or email!'));
        }
    });
}
exports.verifyCredentials = verifyCredentials;
