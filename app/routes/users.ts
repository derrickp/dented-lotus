'use strict';

import { IRouteConfiguration } from "hapi";
import { genSalt, hash } from "bcrypt";
import * as Boom from "boom";
import { User } from "../models/User";
import { createUserSchema } from "../utilities/createUser";
import { verifyUniqueUser, verifyCredentials } from "../utilities/userFunctions";
import { authenticateUserSchema } from "../utilities/authenticateUserSchema";
import { createToken, checkAndDecodeToken } from "../utilities/token";
import { getFullUsers, updateUser, saveUser, getBasicUsers } from "../utilities/sqliteUtilities";

const base64url = require('base64-url');

function hashPassword(password, cb) {
    // Generate a salt at level 10 strength
    genSalt(10, (err, salt) => {
        hash(password, salt, (err, hash) => {
            return cb(err, hash);
        });
    });
}

export const userRoutes: IRouteConfiguration[] = [
    {
        method: 'PUT',
        path: '/users/{key}/updatePassword',
        config: {
            cors: true,
            handler: (req, res) => {
                let credentials = req.auth.credentials;
                let isAdmin = credentials.scope.indexOf('admin') >= 0;
                const key = req.params["key"];
                // If someone tries to save info for a different user, don't allow it, unless the person saving is an admin
                if (key !== credentials.key && !isAdmin) {
                    res(Boom.badRequest("cannot change password for a different user"));
                    return;
                }
                let newPassword = req.payload.newPassword;
                hashPassword(newPassword, (err, hashedPassword) => {
                    if (err) {
                        res(Boom.badRequest(err));
                        return;
                    }
                    // Get the existing user out of the database.
                    getFullUsers(key).then(users => {
                        let existingUser = users[0];
                        if (!existingUser) {
                            res(Boom.badRequest("user key provided was not found"));
                            return;
                        }
                        // Create a new user object that will hold the password and the user's key
                        let newUser = new User();
                        newUser.password = hashedPassword;
                        newUser.key = key;
                        updateUser(newUser).then(updatedUser => {
                            res(updatedUser);
                            return;
                        }).catch(error => {
                            console.log(error);
                            res(Boom.badRequest(error));
                        });
                    });
                });
            },
            auth: {
                strategies: ['jwt'],
                scope: ['user']
            }
        }
    },
    {
        method: 'PUT',
        path: '/users/{key}',
        config: {
            cors: true,
            handler: (req, res) => {
                let credentials = req.auth.credentials;
                let isAdmin = credentials.scope.indexOf('admin') >= 0;
                const key = req.params["key"];
                // If someone tries to save info for a different user, don't allow it, unless the person saving is an admin
                if (key !== credentials.key && !isAdmin) {
                    res(Boom.badRequest("cannot save values for a different user"));
                    return;
                }

                let newUser = new User();
                newUser.displayName = req.payload.displayName;
                newUser.firstName = req.payload.firstName;
                newUser.lastName = req.payload.lastName;
                newUser.key = key;

                if (isAdmin) {
                    newUser.role = req.payload.role;
                    newUser.points = req.payload.points;
                }

                // Get the existing user out of the database.
                getFullUsers(key).then(users => {
                    let existingUser = users[0];
                    if (!existingUser) {
                        res(Boom.badRequest("user key provided was not found"));
                        return;
                    }

                    updateUser(newUser).then(updatedUser => {
                        res(updatedUser);
                        return;
                    }).catch(error => {
                        console.log(error);
                        res(Boom.badRequest(error));
                    });
                });
            },
            auth: {
                strategies: ['jwt'],
                scope: ['user']
            }
        }
    },
    {
        method: 'POST',
        path: '/users',
        config: {
            // Before the route handler runs, verify that
            // the user is unique and assign the result to 'user'
            pre: [
                { method: verifyUniqueUser, assign: 'user' }
            ],
            cors: true,
            handler: (req, res) => {
                let user = new User();
                user.email = req.payload.email;
                user.displayName = req.payload.displayName;
                user.role = "user";
                user.key = base64url.encode(user.email);
                user.firstName = req.payload.firstName;
                user.lastName = req.payload.lastName;
                hashPassword(req.payload.password, (err, hash) => {
                    if (err) {
                        throw Boom.badRequest(err);
                    }
                    user.password = hash;
                    saveUser(user).then(success => {
                        if (success) {
                            res({
                                id_token: createToken(user),
                                key: user.key
                            }).code(201);
                        }
                        else {
                            res(Boom.badRequest("unable to save user"));
                        }

                    }).catch(error => {
                        res(Boom.badRequest(error));
                    });
                });
            },
            // Validate the payload against the Joi schema
            validate: {
                payload: createUserSchema
            }
        }
    },
    {
        method: 'POST',
        path: '/users/authenticate',
        config: {
            // Check the user's password against the DB
            pre: [
                {
                    method: verifyCredentials, assign: 'user'
                }],
            cors: true,
            handler: (req, res) => {
                // If the user's password is correct, we can issue a token.
                // If it was incorrect, the error will bubble up from the pre method
                res({
                    id_token: createToken(req.pre["user"]),
                    key: req.pre["user"]["key"]
                }).code(200);
            },
            validate: {
                payload: authenticateUserSchema
            }
        }
    },
    {
        method: 'DELETE',
        path: '/users/{key}',
        config: {
            cors: true,
            handler: (req, res) => {
                let credentials = req.auth.credentials;
                if (req.params["key"] === credentials.key) {
                    res(Boom.badRequest("cannot delete own user"));
                    return;
                }

            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    },
    {
        method: 'GET',
        path: '/users/{key?}',
        config: {
            cors: true,
            handler: (req, res) => {
                let credentials = req.auth.credentials;
                let isAdmin = credentials.scope.indexOf('admin') >= 0;
                const key = req.params["key"];
                // If the person is requesting their own info, then they can have it.
                if (key === credentials.key) {
                    getFullUsers(credentials.key).then(users => {
                        if (!users) {
                            throw Boom.badRequest("user information could not be found");
                        }
                        var user = users[0];
                        if (!user) {
                            throw Boom.badRequest("user information could not be found");
                        }
                        res(user);
                    });
                }
                // If the person requesting information is a 
                else if (isAdmin) {
                    getFullUsers(key).then(users => {
                        if (key) {
                            let user = users[0];
                            if (!user) {
                                throw Boom.badRequest("user key provided was not found");
                            }
                            res(user);
                            return;
                        }
                        res(users);
                    });
                }
                // They have authenticated, so we'll get them the basic info
                else {
                    getBasicUsers(key).then(users => {
                        if (key) {
                            let user = users[0];
                            if (!user) {
                                throw Boom.badRequest("user key provided was not found");
                            }
                            res(user);
                            return;
                        }
                        res(users);
                    });
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['user']
            }
        }
    }
]