'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";

import {
    getFinalRacePredictions,
    getRaceKeys
} from "../utilities/data/races";
import {
    getPredictionsForRace,
    getUserPicks
} from "../utilities/data/predictions";
import { getFullUsers, updateUser } from "../utilities/data/users";

export const scoreRoutes: IRouteConfiguration[] = [
    {
        method: "POST",
        path: "/admin/score",
        config: {
            cors: true,
            handler: async (request, reply) => {
                try {
                    const users = await getFullUsers();
                    const raceKeys = await getRaceKeys(2017);
                    console.log(raceKeys);
                    for (const user of users) {
                        let points = 0;
                        let numCorrect = 0;
                        // 1. Get their picks
                        const userPicks = await getUserPicks(user.key, raceKeys);
                        for (const raceKey of raceKeys) {
                            const finalPicks = await getFinalRacePredictions(raceKey);
                            const racePredictions = await getPredictionsForRace(raceKey);
                            // 2. Loop through the race predictions
                            for (const rp of racePredictions) {
                                const finalPick = finalPicks.filter(fp => {
                                    return fp.prediction === rp.prediction;
                                })[0];
                                // If we don't have a final pick, then this prediction hasn't been finalized...
                                if (!finalPick) {
                                    continue;
                                }
                                const userPick = userPicks.filter(up => up.prediction === rp.prediction && up.race === raceKey)[0];
                                // If user pick doesn't exist, the user didn't make a pick for this prediction. Continue
                                if (!userPick) {
                                    continue;
                                }
                                // 3. Compare their pick choice to finals
                                if (finalPick.final.includes(userPick.choice)) {
                                    // 4. Award points if correct
                                    const predictionPoints = rp.value * rp.modifier;
                                    points += predictionPoints;
                                    numCorrect += 1;
                                }
                            }
                        }
                        if (points != user.points || numCorrect != user.numCorrectPicks) {
                            await updateUser({ key: user.key, points: points, numCorrectPicks: numCorrect });
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
    }
];