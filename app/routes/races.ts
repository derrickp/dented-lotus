'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";
import { Credentials } from "../../common/models/Authentication";
import {
    getRaces,
    saveRaces,
    DbRace,
    FinalPredictionPick,
    saveFinalRacePredictions,
    getFinalRacePredictions
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
import { RacePrediction, RaceResponse, PredictionChoices } from "../../common/models/Race";
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
                    return;
                }
                try {
                    const credentials: Credentials = request.auth.credentials;
                    const userKey = credentials.key;
                    const races: RaceResponse[] = [];
                    const raceKeys = request.params["key"] ? [request.params["key"]] : [];
                    const raceRows = await getRaces(season, raceKeys);
                    for (const raceRow of raceRows) {
                        const race = getRaceResponse(season, raceRow);
                        const trackKeys = raceRow.track ? [raceRow.track] : [];
                        const tracks = await getTrackResponses([raceRow.track]);
                        if (tracks.length) {
                            race.track = tracks[0];
                        }
                        if (raceRow.winner) {
                            const winnerKeys = raceRow.winner ? [raceRow.winner] : [];
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
        method: "POST",
        path: "/admin/races/{raceKey}/score",
        config: {
            cors: true,
            handler: async (request, reply) => {
                try {
                    const raceKey = request.params["raceKey"];
                    const users = await getFullUsers();
                    const finalPicks = await getFinalRacePredictions(raceKey);
                    const racePredictions = await getPredictionsForRace(raceKey);
                    // For every user we will need to get their picks, and their points, and award them points if they were right
                    for (const user of users) {
                        const initPoints = user.points;
                        // 1. Get their picks
                        const userPicks = await getUserPicks(user.key, [raceKey]);
                        // 2. Loop through the race predictions
                        for (const rp of racePredictions) {
                            const finalPick = finalPicks.filter(fp => {
                                return fp.prediction === rp.prediction;
                            })[0];
                            // If we don't have a final pick, then this prediction hasn't been finalized...
                            if (!finalPick) {
                                continue;
                            }
                            const userPick = userPicks.filter(up => up.prediction === rp.prediction)[0];
                            // If user pick doesn't exist, the user didn't make a pick for this prediction. Continue
                            if (!userPick) {
                                continue;
                            }
                            // 3. Compare their pick choice to finals
                            if (finalPick.final.includes(userPick.choice)) {
                                // 4. Award points if correct
                                const predictionPoints = rp.value * rp.modifier;
                                console.log(`${rp.value} ${rp.modifier} ${predictionPoints}`)
                                user.points += predictionPoints;
                            }
                        }
                        console.log(`${user.email} ${user.points}`);
                        if (user.points !== initPoints) {
                            await updateUser({ key: user.key, points: user.points });
                        }
                    }
                    // Once we're here all user info has been saved
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
        track: undefined,
        trivia: raceRow.trivia ? JSON.parse(raceRow.trivia) : [],
        predictions: [],
        winner: undefined,
        imageUrl: "",
        info: raceRow.info
    };
    return race;
}