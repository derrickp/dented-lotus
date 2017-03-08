'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";
import { getRaces, saveRaces } from "../utilities/data/races";
import { RaceResponse } from "../../common/models/Race";

export const raceRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/races/{season}/{key?}',
        config: {
            cors: true,
            handler: (request, reply) => {
                const season = Number.parseInt(request.params["season"]);
                if (isNaN(season)) {
                    reply(Boom.badRequest("Invalid season"));
                }
                getRaces(season, request.params["key"]).then(races => {
                    reply(races);
                });
            }
        }
    },
    {
        method: "POST",
        path: "/races/{season}",
        config: {
            cors: true,
            handler: (request, reply) => {
                const races: RaceResponse[] = request.payload;
                console.log(request.payload);
                const season: number = Number.parseInt(request.params["season"]);
                if (isNaN(season)) {
                    reply(Boom.badRequest("Invalid season"));
                    return;
                }
                let canContinue = true;
                races.forEach(race => {
                    if (!race.key && (!race.track)) {
                        reply(Boom.badRequest("Need track to save new race"));
                        canContinue = false;
                        return;
                    }
                    if (!race.key) race.key = `${season}-${race.track}`;
                });
                if (!canContinue) return;
                saveRaces(season, races).then(success => {
                    if (!success) {
                        reply(Boom.badRequest("Error saving races"));
                        return;
                    }
                    return getRaces(season);
                }).then(raceResponses => {
                    reply(raceResponses);
                    return;
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