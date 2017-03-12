
import * as sqlite3 from "sqlite3";

import { Credentials } from "../../../common/models/Authentication";
import { PredictionResponse } from "../../../common/models/Prediction";
import { getDriverResponses } from "./drivers";
import { getTeamResponses } from "./teams";

const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

export const predictionsSelect = "select * from predictions_vw";
export const racePredictionSelect = "select * from racepredictions_vw";
export const userPicksSelect = "select * from userpicks_vw";
export const racePredictionsChoicesSelect = "select choice from racepredictionchoices";

export async function getPredictionResponses(raceKeys: string[], credentials: Credentials): Promise<PredictionResponse[]> {
    const predictionResponses: PredictionResponse[] = [];
    const racePredictionRows = await getRacePredictions(raceKeys);
    const drivers = await getDriverResponses(true, []);
    const teams = await getTeamResponses([]);
    const userPicks = await getUserPicks(credentials.key, raceKeys);
    for (const racePredictionRow of racePredictionRows) {
        const prediction: PredictionResponse = {
            allSeason: racePredictionRow.allSeason ? true : false,
            key: racePredictionRow.key,
            value: racePredictionRow.value,
            modifier: racePredictionRow.modifier,
            description: racePredictionRow.description,
            title: racePredictionRow.type,
            numChoices: racePredictionRow.numChoices,
            type: racePredictionRow.type,
            outcome: [],
            userPicks: [],
            choices: [],
        };

        // Get all of the user picks for this prediction
        const theseUserPicks = userPicks.filter(up => {
            return up.prediction === prediction.key;
        }).map(up => {
            return up.choice;
        });

        // Get the choices for this prediction.
        const possibleChoices = await getPredictionChoices(prediction.key, racePredictionRow.race);
        // Use the previously retrieved values.
        switch (prediction.type) {
            case "team":
                if (possibleChoices && possibleChoices.length) {
                    prediction.choices = teams.filter(t => {
                        return possibleChoices.indexOf(t.key) > -1;
                    });
                }
                else {
                    prediction.choices = teams;
                }
                if (theseUserPicks.length) {
                    const teamPicks = teams.filter(t => {
                        return theseUserPicks.indexOf(t.key) > -1;
                    });
                    prediction.userPicks = teamPicks;
                }
                break;
            case "driver":
            default:
                if (possibleChoices && possibleChoices.length) {
                    prediction.choices = drivers.filter(d => {
                        return possibleChoices.indexOf(d.key) > -1;
                    });
                }
                else {
                    prediction.choices = drivers;
                }
                if (theseUserPicks.length) {
                    const driverPicks = drivers.filter(d => {
                        return theseUserPicks.indexOf(d.key) > -1;
                    });
                    prediction.userPicks = driverPicks;
                }
                break;
        }

        predictionResponses.push(prediction);
    }

    return predictionResponses;
}

export function getPredictionChoices(prediction: string, race: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        let statement = `${racePredictionsChoicesSelect} where prediction = '${prediction}' and race = '${race}'`;
        db.all(statement, (err, rows: { choice: string }[]) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows) {
                resolve(rows.map(row => row.choice));
            }
        });
    });
}

export function getUserPicks(userKey: string, raceKeys?: string[]): Promise<DbUserPick[]> {
    return new Promise<DbUserPick[]>((resolve, reject) => {
        let statement = userPicksSelect + " where user = '" + userKey + "'";
        if (raceKeys && raceKeys.length) {
            statement = statement + " and race in ('" + raceKeys.join("','") + "')";
        }
        console.log(statement);
        db.all(statement, (err, rows: DbUserPick[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function getPredictions(key?: string): Promise<PredictionResponse[]> {
    return new Promise((resolve, reject) => {
        let whereStatement: string;
        if (key) {
            whereStatement = `key = '${key}'`;
        }

        db.all(predictionsSelect + " " + whereStatement, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
            return;
        });
    });
}

export function getRacePredictions(raceKeys?: string[]): Promise<DbRacePrediction[]> {
    return new Promise<DbRacePrediction[]>((resolve, reject) => {
        let statement: string;
        if (raceKeys && raceKeys.length) {
            statement = `${racePredictionSelect} WHERE race in ('${raceKeys.join("','")}')`;
        }
        else {
            statement = racePredictionSelect;
        }
        console.log(statement);
        db.all(statement, (err, rows: DbRacePrediction[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
            return;
        });
    });
}

export function saveUserPicks(userPicks: DbUserPick[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const insert = `INSERT OR REPLACE INTO userpicks
            (user, race, prediction, choice)
            VALUES (?1, ?2, ?3, ?4)`;
            db.serialize(() => {
                db.exec("BEGIN;", (beginError) => {
                    if (beginError) {
                        reject(beginError);
                        return;
                    }

                    for (const userPick of userPicks) {
                        if (!userPick.choice) {
                            continue;
                        }
                        const valuesObject = {
                            1: userPick.user,
                            2: userPick.race,
                            3: userPick.prediction,
                            4: userPick.choice
                        };
                        db.run(insert, valuesObject);
                    }
                    db.exec("COMMIT;", (commitError) => {
                        if (commitError) {
                            reject(commitError);
                            return;
                        }
                        resolve(true);
                    });
                });
            });
        } catch (exception) {
            console.log(exception);
            db.exec("ROLLBACK;");
            reject(exception);
        }
    });
}

export function saveRacePredictions(race: string, racePredictions: DbRacePrediction[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const insert = `INSERT OR REPLACE INTO racepredictions
            (prediction, race, value, modifier)
            VALUES (?1, ?2, ?3, ?4)`;
            db.serialize(() => {
                db.exec("BEGIN;", (beginError) => {
                    if (beginError) {
                        reject(beginError);
                        return;
                    }

                    for (const racePrediction of racePredictions) {
                        const valuesObject = {
                            1: racePrediction.key,
                            2: race,
                            3: racePrediction.value,
                            4: racePrediction.modifier
                        };
                        db.run(insert, valuesObject);
                    }
                    db.exec("COMMIT;", (commitError) => {
                        if (commitError) {
                            reject(commitError);
                            return;
                        }
                        resolve(true);
                    });
                });
            });
        }
        catch (exception) {
            console.log(exception);
            db.exec("ROLLBACK;");
            reject(exception);
        }
    });
}

export function savePredictions(predictions: PredictionResponse[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const insert = `INSERT OR REPLACE INTO predictions
            (key, description, title, type, allseason, numchoices) 
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)`;
            db.serialize(() => {
                db.exec("BEGIN;", (beginError) => {
                    if (beginError) {
                        reject(beginError);
                        return;
                    }

                    for (const prediction of predictions) {
                        let valuesObject = {
                            1: prediction.key,
                            2: prediction.description,
                            3: prediction.title,
                            4: prediction.type,
                            5: prediction.allSeason ? 1 : 0,
                            6: prediction.numChoices
                        };
                        db.run(insert, valuesObject);
                    }

                    db.exec("COMMIT;", (commitError) => {
                        if (commitError) {
                            reject(commitError);
                            return;
                        }
                        resolve(true);
                    });
                });
            });
        }
        catch (exception) {
            console.log(exception);
            db.exec("ROLLBACK;");
            reject(exception);
        }
    });
}

export interface DbRacePrediction {
    key: string;
    description?: string;
    title: string;
    type: string;
    allSeason: number;
    numChoices: number;
    value: number;
    modifier: number;
    race: string;
}

export interface DbUserPick {
    user: string;
    race: string;
    choice: string;
    prediction: string;
}