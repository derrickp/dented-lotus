'use strict';

import * as Boom from "boom";
import { IRouteConfiguration } from "hapi";
import { Credentials } from "../../common/models/Authentication";
import { PredictionResponse, UserPickPayload } from "../../common/models/Prediction";
import { DriverResponse } from "../../common/models/Driver";
import { TeamResponse } from "../../common/models/Team";
import { 
    updatePredictions, 
    getPredictions, 
    updateRacePredictions, 
    getRacePredictions, 
    getUserPicks, 
    DbUserPick, 
    saveUserPicks } from "../utilities/data/predictions";

export const predictionsRoutes: IRouteConfiguration[] = [
    {
        method: "GET",
        path: "/predictions/{key?}",
        config: {
            cors: true,
            handler: (request, reply) => {
                const keys = request.params["key"] ? [request.params["key"]] : [];
                getPredictions(keys).then(predictions => {
                    reply(predictions);
                }).catch((error: Error) => {
                    reply(Boom.badRequest(error.message));
                });
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
                updatePredictions(predictions).then(success => {
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
    }
]