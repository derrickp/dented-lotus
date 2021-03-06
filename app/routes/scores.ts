'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";

import {
    getFinalRacePredictions,
    getRaceKeys
} from "../utilities/data/races";
import {
    getPredictionsForRace,
    getUserPicks,
    getModifiers
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
                                const modifiers = await getModifiers(rp.race, rp.prediction);
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
                                    const modifierIndex = modifiers.findIndex(m => m.choice === finalPick.final);
                                    let modifier: number = 1.0;
                                    if (modifierIndex >= 0) {
                                        modifier = modifiers[modifierIndex].modifier;
                                    }
                                    const predictionPoints = Math.round(rp.value * modifier);
                                    points += predictionPoints;
                                    numCorrect += 1;
                                }
                            }
                        }
                        if (points != user.points || numCorrect != user.numCorrectPicks) {
                            user.points = points;
                            user.numCorrectPicks = numCorrect;
                            // await updateUser({ key: user.key, points: points, numCorrectPicks: numCorrect });
                        }
                    }

                    // Sort the users by points and name
                    const sorted = users.sort((user1, user2) => {
                        if (user2.points === user1.points) {
                            return user1.display.localeCompare(user2.display);
                        }
                        return user2.points - user1.points;
                    });

                    for (let i = 0; i < users.length; i++) {
                        const user = users[i];
                        const position = i + 1;
                        const previousPosition = user.position;
                        if (previousPosition) {
                            const positionChange = position - previousPosition;
                            user.positionChange = positionChange;
                        }
                        user.position = position;
                        await updateUser(user);
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