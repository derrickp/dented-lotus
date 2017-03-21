'use strict';

import * as Boom from "boom";
import { IRouteConfiguration } from "hapi";
import { Credentials } from "../../common/models/Authentication";
import { PredictionResponse, UserPickPayload } from "../../common/models/Prediction";
import { DriverResponse } from "../../common/models/Driver";
import { TeamResponse } from "../../common/models/Team";
import { getDriverResponses } from "../utilities/data/drivers";
import { getTeamResponses } from "../utilities/data/teams";
import { 
    updatePredictions, 
    getPredictions, 
    updateRacePredictions, 
    getRacePredictions, 
    getUserPicks, 
    DbUserPick, 
    saveUserPicks,
    getAllSeasonPredictions,
    getAllSeasonValues } from "../utilities/data/predictions";

export const predictionsRoutes: IRouteConfiguration[] = [
    {
        method: "GET",
        path: "/predictions/{key?}",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const keys = request.params["key"] ? [request.params["key"]] : [];
                try {
                    const predictions = await getPredictions(keys);
                    reply(predictions);
                } 
                catch (exception) {
                    reply(Boom.badRequest(exception));
                }
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
                    console.log(predictions);
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
                            prediction.modifier = value.modifier;
                            prediction.raceKey = value.race;
                        }
                        prediction.allSeason = true;
                        if (prediction.type === "driver") {
                            prediction.choices = drivers;
                        }
                        else {
                            prediction.choices = teams;
                        }
                        prediction.userPicks = userPicks.filter(p => {
                            return p.prediction === prediction.key;
                        }).map(p => p.choice);
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