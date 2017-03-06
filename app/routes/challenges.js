'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Boom = require("boom");
var sqliteUtilities_1 = require("../utilities/sqliteUtilities");
exports.challengesRoutes = [
    {
        method: 'GET',
        path: '/challenges',
        config: {
            cors: true,
            handler: function (request, reply) {
                sqliteUtilities_1.getAllChallenges().then(function (challenges) {
                    reply(challenges);
                }).catch(function (error) {
                    reply(Boom.badRequest(error));
                });
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    },
    {
        method: 'GET',
        path: '/challenges/{season}/{raceKey}/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                sqliteUtilities_1.getChallenges(request.params["season"], request.params["raceKey"], request.params["key"]).then(function (challenges) {
                    reply(challenges);
                });
            },
            auth: {
                strategies: ['jwt'],
                scope: ['user']
            }
        }
    },
    {
        method: 'GET',
        path: '/challenges/{season}/{raceKey}/{userKey}/picks/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                var credentials = request.auth.credentials;
                if (request.params["userKey"] !== credentials.key) {
                    throw Boom.badRequest("cannot request picks for different user");
                }
                sqliteUtilities_1.getUserPicks(request.params["userKey"], request.params["season"], request.params["raceKey"], request.params["key"]).then(function (picks) {
                    reply(picks);
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
        path: '/challenges/{season}/{raceKey}/{userKey}/picks',
        config: {
            cors: true,
            handler: function (request, reply) {
                var credentials = request.auth.credentials;
                if (request.params["userKey"] !== credentials.key) {
                    throw Boom.badRequest("cannot save picks for different user");
                }
                var picks = [];
                var season = parseInt(request.params["season"]);
                var raceKey = request.params["raceKey"];
                var userKey = request.params["userKey"];
                if (request.payload) {
                    var restUserPicks = JSON.parse(request.payload);
                    console.log(restUserPicks);
                    if (restUserPicks.length) {
                        restUserPicks.forEach(function (cdm) {
                            var pick = {
                                season: season,
                                raceKey: raceKey,
                                userKey: userKey,
                                challengeKey: cdm.key,
                                choice: cdm.value
                            };
                            picks.push(pick);
                        });
                        sqliteUtilities_1.saveUserPicks(picks).then(function (success) {
                            reply(success).code(200);
                        });
                    }
                    else {
                        throw Boom.badRequest("no valid picks given to save");
                    }
                }
                else {
                    throw Boom.badRequest("no valid picks given to save");
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['user']
            }
        }
    }
];
