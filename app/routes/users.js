'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Boom = require("boom");
var User_1 = require("../models/User");
var createUser_1 = require("../utilities/createUser");
var userFunctions_1 = require("../utilities/userFunctions");
var authenticateUserSchema_1 = require("../utilities/authenticateUserSchema");
var token_1 = require("../utilities/token");
var sqliteUtilities_1 = require("../utilities/sqliteUtilities");
var base64url = require('base64-url');
exports.userRoutes = [
    {
        method: 'PUT',
        path: '/users/{key}',
        config: {
            cors: true,
            handler: function (req, res) {
                var credentials = req.auth.credentials;
                var isAdmin = credentials.scope.indexOf('admin') >= 0;
                var key = req.params["key"];
                // If someone tries to save info for a different user, don't allow it, unless the person saving is an admin
                if (key !== credentials.key && !isAdmin) {
                    res(Boom.badRequest("cannot save values for a different user"));
                    return;
                }
                var newUser = new User_1.User();
                newUser.displayName = req.payload.displayName;
                newUser.firstName = req.payload.firstName;
                newUser.lastName = req.payload.lastName;
                newUser.key = key;
                if (isAdmin) {
                    newUser.role = req.payload.role;
                    newUser.points = req.payload.points;
                }
                // Get the existing user out of the database.
                sqliteUtilities_1.getFullUsers(key).then(function (users) {
                    var existingUser = users[0];
                    if (!existingUser) {
                        res(Boom.badRequest("user key provided was not found"));
                        return;
                    }
                    sqliteUtilities_1.updateUser(newUser).then(function (updatedUser) {
                        res(updatedUser);
                        return;
                    }).catch(function (error) {
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
                { method: userFunctions_1.verifyUniqueUser, assign: 'user' }
            ],
            cors: true,
            handler: function (req, res) {
                var user = new User_1.User();
                user.email = req.payload.email;
                user.displayName = req.payload.displayName;
                user.role = "user";
                user.key = base64url.encode(user.email);
                user.firstName = req.payload.firstName;
                user.lastName = req.payload.lastName;
                sqliteUtilities_1.saveUser(user).then(function (success) {
                    if (success) {
                        res({
                            id_token: token_1.createToken(user),
                            user: user
                        }).code(201);
                    }
                    else {
                        res(Boom.badRequest("unable to save user"));
                    }
                }).catch(function (error) {
                    res(Boom.badRequest(error));
                });
            },
            // Validate the payload against the Joi schema
            validate: {
                payload: createUser_1.createUserSchema
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
                    method: userFunctions_1.verifyCredentials, assign: 'user'
                }
            ],
            cors: true,
            handler: function (req, res) {
                // If we get here with a user, then we are good to go. Let's issue that token
                // If not, then the error bubbles up from the verify step
                res({
                    id_token: token_1.createToken(req.pre["user"]),
                    user: req.pre["user"]
                }).code(200);
            },
            validate: {
                payload: authenticateUserSchema_1.authenticateUserSchema
            }
        }
    },
    {
        method: 'DELETE',
        path: '/users/{key}',
        config: {
            cors: true,
            handler: function (req, res) {
                var credentials = req.auth.credentials;
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
            handler: function (req, res) {
                var credentials = req.auth.credentials;
                var isAdmin = credentials.scope.indexOf('admin') >= 0;
                var key = req.params["key"];
                // If the person is requesting their own info, then they can have it.
                if (key === credentials.key) {
                    sqliteUtilities_1.getFullUsers(credentials.key).then(function (users) {
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
                else if (isAdmin) {
                    sqliteUtilities_1.getFullUsers(key).then(function (users) {
                        if (key) {
                            var user = users[0];
                            if (!user) {
                                throw Boom.badRequest("user key provided was not found");
                            }
                            res(user);
                            return;
                        }
                        res(users);
                    });
                }
                else {
                    sqliteUtilities_1.getBasicUsers(key).then(function (users) {
                        if (key) {
                            var user = users[0];
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
];
