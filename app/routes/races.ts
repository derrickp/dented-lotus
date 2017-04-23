'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";
import { Credentials } from "../../common/authentication";
import {
    getRaces,
    saveRaces,
    DbRace,
    FinalPredictionPick,
    saveFinalRacePredictions,
    getFinalRacePredictions,
    getRaceKeys
} from "../utilities/data/races";
import { getDriverResponses } from "../utilities/data/drivers";
import { getTrackResponses } from "../utilities/data/tracks";
import {
    getPredictionResponses,
    updateRacePredictions,
    deleteRacePredictions,
    savePredictionChoices,
    getPredictionsForRace,
    getUserPicks
} from "../utilities/data/predictions";
import { getFullUsers, updateUser } from "../utilities/data/users";
import { RacePrediction, PredictionChoices } from "../../common/models/Race";
import { RaceResponse } from "../../common/responses/RaceResponse";
import { TrackResponse } from "../../common/responses/TrackResponse";
import { DriverResponse } from "../../common/responses/DriverResponse";
import { PredictionResponse } from "../../common/responses/PredictionResponse";

export const raceRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/races/{season}/{key?}',
        config: {
            cors: true,
            handler: async (request, reply: (races: RaceResponse[] | Boom.BoomError) => void) => {
                const season = Number.parseInt(request.params["season"]);
                if (isNaN(season)) {
                    reply(Boom.badRequest("Invalid season"));
                    return;
                }
                try {
                    const races: RaceResponse[] = [];
                    const raceKeys = request.params["key"] ? [request.params["key"]] : [];
                    const raceRows = await getRaces(season, raceKeys);
                    for (const raceRow of raceRows) {
                        const race = getRaceResponse(season, raceRow);
                        races.push(race);
                    }
                    reply(races);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            }
        }
    },
    {
        method: "POST",
        path: "/admin/races/{season}",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const races: RaceResponse[] = request.payload;
                const season: number = Number.parseInt(request.params["season"]);
                if (isNaN(season)) {
                    reply(Boom.badRequest("Invalid season"));
                    return;
                }

                for (const race of races) {
                    if ((!race.track)) {
                        reply(Boom.badRequest("Need track to save new race"));
                        return;
                    }
                    if (!race.key) race.key = `${season}-${race.track}`;
                }
                try {
                    const success = await saveRaces(season, races);
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
        method: "POST",
        path: "/admin/races/{raceKey}/predictions",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const adds: RacePrediction[] = request.payload;
                const raceKey = request.params["raceKey"];
                try {
                    const dbAdds: RacePrediction[] = [];
                    for (const add of adds) {
                        const dbAdd: RacePrediction = {
                            race: raceKey,
                            prediction: add.prediction,
                            value: add.value,
                            modifier: add.modifier ? add.modifier : 1.0
                        };
                        dbAdds.push(dbAdd);
                    }
                    await updateRacePredictions(raceKey, dbAdds);
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
        method: "POST",
        path: "/admin/races/{raceKey}/predictions/choices",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const raceKey = request.params["raceKey"];
                const predictionChoices: PredictionChoices[] = request.payload;
                try {
                    for (const predictionChoice of predictionChoices) {
                        await savePredictionChoices(predictionChoice.prediction, raceKey, predictionChoice.choices);
                    }
                    reply({ success: true });
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
        method: "POST",
        path: "/admin/races/{raceKey}/predictions/finals",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const raceKey = request.params["raceKey"];
                const finalPredictionPicks: FinalPredictionPick[] = request.payload;
                try {
                    await saveFinalRacePredictions(raceKey, finalPredictionPicks);
                    reply({ success: true });
                }
                catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            },
            auth: {
                strategies: ["jwt"],
                scope: ["admin"]
            }
        }
    },
    {
        method: "DELETE",
        path: "/admin/races/predictions/{raceKey}",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const raceKey = request.params["raceKey"];
                const predictionKeys: string[] = request.payload;
                if (!predictionKeys || !predictionKeys.length) {
                    reply("done");
                }
                try {
                    await deleteRacePredictions(raceKey, predictionKeys);
                    reply("done");
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
        track: raceRow.track,
        trivia: raceRow.trivia ? JSON.parse(raceRow.trivia) : [],
        winner: raceRow.winner,
        imageUrl: "",
        info: raceRow.info
    };
    return race;
}