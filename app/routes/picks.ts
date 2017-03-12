'use strict';

import * as Boom from "boom";
import { IRouteConfiguration } from "hapi";
import { Credentials } from "../../common/models/Authentication";
import { PredictionResponse, UserPickPayload } from "../../common/models/Prediction";
import {
    getUserPicks, 
    DbUserPick, 
    saveUserPicks } from "../utilities/data/predictions";

export const pickRoutes: IRouteConfiguration[] = [
    {
        method: "POST",
        path: "/picks",
        config: {
            cors: true,
            handler: async (request, reply) => {
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
    }
]