'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";
import { UserResponse } from "../../common/responses/UserResponse";
import { Credentials } from "../../common/authentication";
import { createUserSchema } from "../utilities/createUser";
import { verifyUniqueUser, verifyCredentials } from "../utilities/userFunctions";
import { authenticateUserSchema } from "../utilities/authenticateUserSchema";
import { createToken, checkAndDecodeToken } from "../utilities/token";
import {
    getFullUsers,
    updateUser,
    saveUser,
    getUsersByEmail,
    getUsersByKeys,
    getAllPublicUsers,
    deleteUser
} from "../utilities/data/users";
const base64url = require("base64-url");

export const userRoutes: IRouteConfiguration[] = [
    {
        method: 'PUT',
        path: '/users/{key}',
        config: {
            cors: true,
            handler: async (req, res) => {
                let credentials: Credentials = req.auth.credentials;
                let isAdmin = credentials.scope.indexOf('admin') >= 0;
                const key = req.params["key"];
                // If someone tries to save info for a different user, don't allow it, unless the person saving is an admin
                if (key !== credentials.key && !isAdmin) {
                    res(Boom.badRequest("cannot save values for a different user"));
                    return;
                }
                try {
                    const userPayload: UserResponse = req.payload;

                    const fullUsers = await getFullUsers([key]);
                    let existingUser = fullUsers[0];
                    if (!existingUser) {
                        res(Boom.badRequest("user key provided was not found"));
                        return;
                    }
                    const newUser: UserResponse = {
                        key: key,
                        displayName: userPayload.displayName ? userPayload.displayName : existingUser.displayName,
                        firstName: userPayload.firstName ? userPayload.firstName : existingUser.firstName,
                        lastName: userPayload.lastName ? userPayload.lastName : existingUser.lastName,
                        imageUrl: userPayload.imageUrl ? userPayload.imageUrl : existingUser.imageUrl,
                        faveDriver: userPayload.faveDriver ? userPayload.faveDriver : existingUser.faveDriver,
                        faveTeam: userPayload.faveTeam ? userPayload.faveTeam : existingUser.faveTeam
                    };
                    newUser.role = userPayload.role && isAdmin ? userPayload.role : existingUser.role;
                    newUser.points = userPayload.points && isAdmin ? userPayload.points : existingUser.points;
                    await updateUser(newUser);
                    res({ success: true });
                }
                catch (exception) {
                    console.error(exception);
                    res(Boom.badRequest(exception));
                }
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
                let user: UserResponse = {
                    key: base64url.encode(req.payload.email)
                };
                user.email = req.payload.email;
                user.displayName = req.payload.displayName;
                user.role = "user";
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
            handler: async (req, res) => {
                let credentials = req.auth.credentials;
                if (req.params["key"] === credentials.key) {
                    res(Boom.badRequest("cannot delete own user"));
                    return;
                }
                try {
                    await deleteUser(req.params["key"]);
                    res({ success: true });
                }
                catch (exception) {
                    res(Boom.badRequest(exception));
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
            handler: async (req, res) => {
                let credentials = req.auth.credentials;
                let isAdmin = credentials.scope.indexOf('admin') >= 0;
                const keys = req.params["key"] ? [req.params["key"]] : [];
                // If the person is requesting their own info, then they can have it.
                if (keys.length === 1 && keys[0] === credentials.key) {
                    try {
                        const users = await getFullUsers(keys);
                        res(users);
                    }
                    catch (exception) {
                        res(Boom.badRequest(exception));
                    }
                }
                // If the person requesting information is a 
                else if (isAdmin) {
                    try {
                        const users = await getFullUsers(keys);
                        res(users);
                    }
                    catch (exception) {
                        res(Boom.badRequest(exception));
                    }
                }
                // They have authenticated, so we'll get them the basic info
                else {
                    try {
                        const users = await getUsersByKeys(keys);
                        res(users);
                    }
                    catch (exception) {
                        res(Boom.badRequest(exception));
                    }
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
            handler: async (req, res) => {
                // const users = await getUsersByKeys([]);
                // res(users);
                const users = await getAllPublicUsers();
                res(users);
                // getAllPublicUsers().then(users => {
                //     res(users);
                // });
            }
        }
    }
]