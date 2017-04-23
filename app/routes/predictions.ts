'use strict';

import * as Boom from "boom";
import { IRouteConfiguration } from "hapi";
import { Credentials } from "../../common/authentication";
import { PredictionResponse, PredictionTypes } from "../../common/responses/PredictionResponse";
import { UserPickPayload } from "../../common/payloads/UserPickPayload";
import { DriverResponse } from "../../common/responses/DriverResponse"; 
import { TeamResponse } from "../../common/responses/TeamResponse";  
import { ModifierResponse } from "../../common/responses/PredictionResponse"; 
import { getDriverResponses } from "../utilities/data/drivers";
import { getTeamResponses } from "../utilities/data/teams";
import {
    updatePredictions,
    getPredictions,
    getUserPicks,
    DbUserPick,
    saveUserPicks,
    getAllSeasonPredictions,
    getAllSeasonValues,
    getPredictionResponses,
    getModifiers,
    savePredictionModifiers
} from "../utilities/data/predictions";

export const predictionsRoutes: IRouteConfiguration[] = [
    // Get modifiers for race/prediction
    {
        method: "GET",
        path: "/predictions/modifiers/{raceKey}/{predictionKey}",
        config: {
            cors: true,
            handler: async (request, reply: (predictions: ModifierResponse[] | Boom.BoomError) => void) => {
                const credentials: Credentials = request.auth.credentials;
                const userKey = credentials.key;
                const raceKey= request.params["raceKey"];
                const predictionKey = request.params["predictionKey"];
                try {
                    const modifiers = await getModifiers(raceKey,predictionKey);
                    reply(modifiers);
                }
                catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['user']
            }
        }
    },
    {
        method: "POST",
        path: "/admin/predictions/modifiers/{raceKey}/{predictionKey}",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const adds: ModifierResponse[] = request.payload;
                const raceKey = request.params["raceKey"];
                const predictionKey = request.params["predictionKey"];
                try {
                    await savePredictionModifiers(predictionKey, raceKey, adds);
                    reply({ success: true }).code(201);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    },
    {
        method: "GET",
        path: "/predictions/{raceKey}",
        config: {
            cors: true,
            handler: async (request, reply: (predictions: PredictionResponse[] | Boom.BoomError) => void) => {
                const credentials: Credentials = request.auth.credentials;
                const userKey = credentials.key;
                const raceKeys = request.params["raceKey"] ? [request.params["raceKey"]] : [];
                try {
                    const predictions = await getPredictionResponses(raceKeys, credentials.key);
                    reply(predictions);
                }
                catch (exception) {
                    reply(Boom.badRequest(exception));
                }
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
            handler: async (request, reply) => {
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
                    prediction.key = prediction.title.replace(/\s+/g, '-').replace(/\)+/g, '').replace(/\(+/g, '').toLowerCase();
                }
                try {
                    const success = await updatePredictions(predictions);
                    const newPredictions = await getPredictions();
                    reply(newPredictions);
                }
                catch (exception) {
                    reply(Boom.badRequest(exception))
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    },
    {
        method: "GET",
        path: "/allseason/predictions",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const credentials: Credentials = request.auth.credentials;
                const keys = request.params["key"] ? [request.params["key"]] : [];
                try {
                    const predictions = await getAllSeasonPredictions();
                    const values = await getAllSeasonValues();
                    const drivers = await getDriverResponses();
                    const teams = await getTeamResponses();
                    const userPicks = await getUserPicks(credentials.key, ["2017-season"]);
                    for (const prediction of predictions) {
                        const value = values.filter(v => {
                            return v.prediction === prediction.key;
                        })[0];
                        if (value) {
                            prediction.value = value.value; 
                            prediction.raceKey = value.race;
                        }
                        prediction.allSeason = true;
                        prediction.userPick = userPicks.filter(p => {
                            return p.prediction === prediction.key;
                        }).map(p => p.choice)[0];
                    }
                    reply(predictions);
                }
                catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['user']
            }
        }
    }
]