'use strict';
import * as Boom from "boom";
import { getUsers } from "./sqliteUtilities";

export function verifyUniqueUser(req, res) {
    // Find an entry from the database that
    // matches the email
    getUsers(req.payload.email).then(users => {
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

export function verifyCredentials(req, res) {

    const password = req.payload.password;

    // Find an entry from the database that
    // matches either the email or username
    getUsers(req.payload.email, true).then(users => {
        if (users && users.length > 0) {
            var user = users[0];
            if (user) {
                // !TODO! - Do a new compare with the id_token or something here. No storing passwords
                res(user);
                // compare(password, user.pass, (err, isValid) => {
                //     if (isValid) {
                //         user.password = null;
                //         res(user);
                //         return;
                //     }
                //     else {
                //         res(Boom.badRequest('Incorrect password!'));
                //         return;
                //     }
                // });
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