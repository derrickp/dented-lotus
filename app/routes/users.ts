'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";
import { UserResponse } from "../../common/models/User";
import { SignupInfo } from "../../common/models/Signup";
import { Credentials } from "../../common/models/Authentication";
import { createUserSchema } from "../utilities/createUser";
import { verifyUniqueUser, verifyCredentials } from "../utilities/userFunctions";
import { authenticateUserSchema } from "../utilities/authenticateUserSchema";
import { createToken, checkAndDecodeToken } from "../utilities/token";
import { getFullUsers, updateUser, saveUser, getUsersByEmail, getUsersByKeys, saveRequestedUser,getAllPublicUsers } from "../utilities/data/users";
const base64url = require("base64-url");

export const userRoutes: IRouteConfiguration[] = [
    {
        method: 'PUT',
        path: '/users/{key}',
        config: {
            cors: true,
            handler: (req, res) => {
                let credentials: Credentials = req.auth.credentials;
                let isAdmin = credentials.scope.indexOf('admin') >= 0;
                const key = req.params["key"];
                // If someone tries to save info for a different user, don't allow it, unless the person saving is an admin
                if (key !== credentials.key && !isAdmin) {
                    res(Boom.badRequest("cannot save values for a different user"));
                    return;
                }

                let newUser: UserResponse = {
                    displayName: req.payload.displayName,
                    firstName: req.payload.firstName,
                    lastName: req.payload.lastName,
                    key: key
                };

                if (isAdmin) {
                    newUser.role = req.payload.role;
                    newUser.points = req.payload.points;
                }

                // Get the existing user out of the database.
                getFullUsers([key]).then(users => {
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
        path: '/signup',
        config: {
            pre: [
                { method: verifyUniqueUser, assign: 'user' }
            ],
            cors: true,
            handler: async (request, reply) => {
                try {
                    const info: SignupInfo = request.payload;
                    await saveRequestedUser(info);
                    reply({ status: "success" });
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
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
                let user: UserResponse = {};
                user.email = req.payload.email;
                user.displayName = req.payload.displayName;
                user.role = "user";
                user.key = base64url.encode(user.email);
                user.firstName = req.payload.firstName;
                user.lastName = req.payload.lastName;
                saveUser(user).then(success => {
                    if (success) {
                        res({
                            id_token: createToken(user),
                            user: user
                        }).code(201);
                    }
                    else {
                        res(Boom.badRequest("unable to save user"));
                    }
                }).catch(error => {
                    res(Boom.badRequest(error));
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
                // If we get here with a user, then we are good to go. Let's issue that token
                // If not, then the error bubbles up from the verify step
                res({
                    id_token: createToken(req.pre["user"]),
                    user: req.pre["user"]
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
                    getFullUsers([key]).then(users => {
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
                    getUsersByKeys([key]).then(users => {
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
    },
    {
        method: 'GET',
        path: '/allusers',
        config: {
            cors: true,
            handler: (req, res) => {
                let credentials = req.auth.credentials; 
                getAllPublicUsers().then(users => {   
                    res(users);
                }); 
            }
        }
    }
]