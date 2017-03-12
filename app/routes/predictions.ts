'use strict';

import * as Boom from "boom";
import { IRouteConfiguration } from "hapi";
import { Credentials } from "../../common/models/Authentication";
import { PredictionResponse, UserPickPayload } from "../../common/models/Prediction";
import { DriverResponse } from "../../common/models/Driver";
import { TeamResponse } from "../../common/models/Team";
import { 
    savePredictions, 
    getPredictions, 
    saveRacePredictions, 
    getRacePredictions, 
    getUserPicks, 
    DbUserPick, 
    saveUserPicks } from "../utilities/data/predictions";

export const predictionsRoutes: IRouteConfiguration[] = [
    {
        method: "GET",
        path: "/admin/predictions/{key?}",
        config: {
            cors: true,
            handler: (request, reply) => {
                const key = request.params["key"];
                getPredictions(key).then(predictions => {
                    reply(predictions);
                }).catch((error: Error) => {
                    reply(Boom.badRequest(error.message));
                });
            }
        }
    },
    {
        method: "POST",
        path: "/picks",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const raceKey = request.params["race"];
                const credentials: Credentials = request.auth.credentials;
                const userChoices: UserPickPayload[] = request.payload;
                if (userChoices && userChoices.length) {
                    const dbUserPicks: DbUserPick[] = [];
                    for (const userChoice of userChoices) {
                        const pick: DbUserPick = {
                            race: userChoice.race,
                            prediction: userChoice.prediction,
                            choice: userChoice.choice,
                            user: credentials.key
                        };
                        dbUserPicks.push(pick);
                    }
                    const success = await saveUserPicks(dbUserPicks);
                }
                reply("done").code(201);
            },
            auth: {
                strategies: ['jwt'],
                scope: ['user']
            }
        }
    },
    {
        method: "POST",
        path: "/admin/predictions",
        config: {
            cors: true,
            handler: (request, reply) => {
                const predictions: PredictionResponse[] = request.payload;
                for (const prediction of predictions) {
                    if (prediction.key) {
                        reply(Boom.badRequest("can't create new predictions with existing key"));
                        return;
                    }
                    if (!prediction.title) {
                        reply(Boom.badRequest("new predictions need a title"));
                        return;
                    }
                    prediction.key = prediction.title.replace(/\s+/g, '-').toLowerCase();
                }
                savePredictions(predictions).then(success => {
                    return getPredictions();
                }).then(predictions => {
                    reply(predictions);
                }).catch((error: Error) => {
                    reply(Boom.badRequest(error.message));
                });
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    },
    {
        method: "POST",
        path: "/admin/predictions/race/{race}",
        config: {
            cors: true,
            handler: (request, reply) => {
                const racePredictions: any[] = request.payload;
                const race = request.params["race"];
                for (const racePrediction of racePredictions) {
                    if (!race || !racePrediction.prediction) {
                        reply(Boom.badRequest("race predictions need a prediction and race"));
                        return;
                    }
                }
                // !TODO! Currently we aren't checking to see if these are new or not.
                // This is bad for a POST, but for now? Deal with later.
                saveRacePredictions(race, racePredictions).then(success => {
                    return getRacePredictions([race]);
                }).then(newRacePredictions => {
                    reply(newRacePredictions);
                }).catch((error: Error) => {
                    reply(Boom.badRequest(error.message));
                });
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    }
]