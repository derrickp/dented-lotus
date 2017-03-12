'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";
import { Credentials } from "../../common/models/Authentication";
import { getRaces, saveRaces, DbRace } from "../utilities/data/races";
import { getDriverResponses } from "../utilities/data/drivers";
import { getTrackResponses } from "../utilities/data/tracks";
import { getPredictionResponses, saveRacePredictions, DbRacePrediction } from "../utilities/data/predictions";
import { RaceResponse } from "../../common/models/Race";
import { TrackResponse } from "../../common/models/Track";
import { DriverResponse } from "../../common/models/Driver";
import { PredictionResponse } from "../../common/models/Prediction";

export const raceRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/races/{season}/{key?}',
        config: {
            cors: true,
            handler: async (request, reply) => {
                const season = Number.parseInt(request.params["season"]);
                if (isNaN(season)) {
                    reply(Boom.badRequest("Invalid season"));
                }
                try {
                    const credentials: Credentials = request.auth.credentials;
                    const userKey = credentials.key;
                    const races: RaceResponse[] = [];
                    const raceKeys = request.params["key"] ? [request.params["key"]] : [];
                    const raceRows = await getRaces(season, raceKeys);
                    for (const raceRow of raceRows) {
                        const race = getRaceResponse(season, raceRow);
                        const tracks = await getTrackResponses([raceRow.track]);
                        if (tracks.length) {
                            race.track = tracks[0];
                        }
                        if (raceRow.winner) {
                            const winners = await getDriverResponses(false, [raceRow.winner]);
                            if (winners.length) {
                                race.winner = winners[0];
                            }
                        }
                        const predictions = await getPredictionResponses([raceRow.key], credentials);
                        if (predictions && predictions.length) {
                            race.predictions = predictions;
                        }
                        races.push(race);
                    }
                    reply(races);
                } catch (exception) {
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
        path: "/races/{season}",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const races: RaceResponse[] = request.payload;
                console.log(request.payload);
                const season: number = Number.parseInt(request.params["season"]);
                if (isNaN(season)) {
                    reply(Boom.badRequest("Invalid season"));
                    return;
                }

                for (const race of races) {
                    if (!race.key && (!race.track)) {
                        reply(Boom.badRequest("Need track to save new race"));
                        return;
                    }
                    if (!race.key) race.key = `${season}-${race.track}`;
                }
                try {
                    const success = await saveRaces(season, races);
                    reply("done").code(201);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    }
]

function getRaceResponse(season: number, raceRow: DbRace): RaceResponse {
    const race: RaceResponse = {
        key: raceRow.key,
        displayName: raceRow.displayName,
        laps: raceRow.laps,
        qualiDate: raceRow.qualiDate,
        raceDate: raceRow.raceDate,
        cutoff: raceRow.cutoff,
        season: season,
        track: undefined,
        trivia: raceRow.trivia ? JSON.parse(raceRow.trivia) : [],
        predictions: [],
        winner: undefined
    };
    return race;
}