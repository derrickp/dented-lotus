'use strict';
import * as Boom from "boom";
import { getUsersByEmail } from "./data/users";
import { AuthenticationPayload } from "../../common/models/Authentication";
import { GOOGLE_CLIENT_ID } from "../config";

import * as GoogleAuth from "google-auth-library";

export function verifyUniqueUser(req, res) {
    // Find an entry from the database that
    // matches the email
    const email: string = req.payload.email;
    getUsersByEmail([email]).then(users => {
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

function verifyGoogleId(token: string): Promise<string> {
    console.log("Checking google id token");
    return new Promise<string>((resolve, reject) => {
        const GoogleAuth = require('google-auth-library');
        const auth = new GoogleAuth;
        const client = new auth.OAuth2(GOOGLE_CLIENT_ID, '', '');
        client.verifyIdToken(
            token,
            GOOGLE_CLIENT_ID,
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
            (error, login) => {
                if (error) {
                    reject(error);
                    return;
                }
                const payload = login.getPayload();
                const userid = payload['sub'];
                // If request specified a G Suite domain:
                //var domain = payload['hd'];
                resolve(payload.email);
            });
    });
}

export function verifyCredentials(req, res) {
    const authPayload: AuthenticationPayload = req.payload;
    let authPromise: Promise<any>;
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
    authPromise.then((email) => {
        getUsersByEmail([email]).then(users => {
            if (users && users.length > 0) {
                var user = users[0];
                // If we have a user at this point, everything is good to go.
                // We've already verified their token previously.
                console.log(user);
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
    }).catch((error: Error) => {
        res(Boom.badRequest(error.message));    
    });
}