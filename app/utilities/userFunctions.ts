'use strict';
import * as Boom from "boom";
import fetch from "node-fetch";
import { getUsersByEmail, saveUser } from "./data/users";
import { AuthenticationPayload } from "../../common/models/Authentication";
import { GOOGLE_CLIENT_ID } from "../config";
import { UserResponse } from "../../common/models/User";

import * as GoogleAuth from "google-auth-library";

const base64url = require("base64-url");

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

function verifyFacebook(token: string): Promise<FacebookAuthResponse> {
    console.log("checking facebook info");
    const fields = ["id", "name", "email", "first_name", "last_name"];
    const urlFields = fields.join("%2C");
    return new Promise<FacebookAuthResponse>((resolve, reject) => {
        return fetch(`https://graph.facebook.com/v2.8/me?access_token=${token}&debug=all&fields=${urlFields}&format=json&method=get&pretty=0`)
            .then((response) => {
                if (response.ok) {
                    return response.json().then((json: FacebookAuthResponse) => {
                        resolve(json);
                        console.log(json);
                    });
                }
                else {
                    reject(new Error(response.statusText));
                }
            }).catch(reject);
    });
}

function verifyGoogleId(token: string): Promise<GoogleAuthResponse> {
    console.log("Checking google id token");
    return new Promise<GoogleAuthResponse>((resolve, reject) => {
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
                resolve(payload);
            });
    });
}

export async function verifyCredentials(req, res) {
    const authPayload: AuthenticationPayload = req.payload;

    try {
        let authResponse: CombinedAuth;
        switch (authPayload.authType) {
            case "google":
                const googlePayload = await verifyGoogleId(authPayload.auth_token);
                authResponse = {
                    email: googlePayload.email,
                    first_name: googlePayload.given_name,
                    last_name: googlePayload.family_name,
                    name: googlePayload.name
                };
                break;
            case "facebook":
                const facebookPayload = await verifyFacebook(authPayload.auth_token);
                authResponse = {
                    email: facebookPayload.email,
                    first_name: facebookPayload.first_name,
                    last_name: facebookPayload.last_name,
                    name: facebookPayload.name
                };
                break;
            default:
                res(Boom.badRequest("Invalid authentication type"));
                return;
        }

        // Find an entry from the database that
        // matches either the email or username
        const users = await getUsersByEmail([authResponse.email]);
        if (users && users.length > 0) {
            // We have a user. So let's return it.
            res(users[0]);
            return;
        }
        else {
            // We don't have a user in our db for this token yet. 
            // Let's go ahead and make one
            const key = base64url.encode(authResponse.email);
            const user: UserResponse = {
                key: key,
                email: authResponse.email,
                displayName: authResponse.name,
                firstName: authResponse.first_name,
                lastName: authResponse.last_name,
                role: "user"
            };
            const success = await saveUser(user);
            if (!success) {
                res(Boom.badRequest("Failed to save new user"));
                return;
            }
            res(user);
        }
    }
    catch (exception) {
        res(Boom.badRequest('Incorrect token!'));
    }
}

export interface GoogleAuthResponse {
    email: string;
    email_verified: boolean;
    name: string;
    picture: string,
    given_name: string;
    family_name: string;
    locale: string;
}

export interface FacebookAuthResponse {
    email: string;
    name: string;
    first_name: string;
    last_name: string;
    id: string;
}

export interface CombinedAuth {
    email: string;
    name: string;
    first_name: string;
    last_name: string;
}