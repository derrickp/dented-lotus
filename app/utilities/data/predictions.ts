
import * as sqlite3 from "sqlite3";

import { Credentials } from "../../../common/models/Authentication";
import { PredictionResponse } from "../../../common/models/Prediction";
import { getDriverResponses } from "./drivers";
import { getTeamResponses } from "./teams";

const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

const predictionsSelect = "select * from predictions_vw";
const racePredictionSelect = "select * from racepredictions_vw";
const userPicksSelect = "select * from userpicks_vw";
const racePredictionsChoicesSelect = "select choice from racepredictionchoices";

export async function getPredictionResponses(raceKeys: string[], credentials: Credentials): Promise<PredictionResponse[]> {
    const predictionResponses: PredictionResponse[] = [];
    const racePredictionRows = await getRacePredictions(raceKeys);
    const predictionKeys = racePredictionRows.filter(rp => rp.prediction).map(rp => rp.prediction);
    const predictions = await getPredictions(predictionKeys);
    const drivers = await getDriverResponses(true, []);
    const teams = await getTeamResponses([]);
    const userPicks = await getUserPicks(credentials.key, raceKeys);
    for (const racePredictionRow of racePredictionRows) {
        const thisPrediction = predictions.filter(p => {
            return p.key === racePredictionRow.prediction;
        })[0];
        // If we don't have a base prediction, then we won't add this.
        if (!thisPrediction) {
            continue;
        }
        const prediction: PredictionResponse = {
            allSeason: thisPrediction.allSeason ? true : false,
            key: thisPrediction.key,
            value: racePredictionRow.value,
            modifier: racePredictionRow.modifier,
            description: thisPrediction.description,
            title: thisPrediction.title,
            numChoices: thisPrediction.numChoices,
            type: thisPrediction.type,
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

export function savePredictionChoices(prediction: string, race: string, choices: string[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        if (!prediction || !race) {
            reject(new Error("need race key and prediction key"));
            return;
        }
        const deleteStatement = `DELETE FROM racepredictionchoices where race == '${race}' AND prediction == '${prediction}'`
        db.run(deleteStatement, (err) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const insert = `INSERT OR REPLACE INTO racepredictionchoices
            (race, prediction, choice)
            VALUES (?1, ?2, ?3)`;
                db.serialize(() => {
                    db.exec("BEGIN;", (beginError) => {
                        if (beginError) {
                            reject(beginError);
                            return;
                        }

                        for (const choice of choices) {
                            if (!choice) {
                                continue;
                            }
                            const valuesObject = {
                                1: race,
                                2: prediction,
                                3: choice,
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

export function getPredictions(keys?: string[]): Promise<PredictionResponse[]> {
    return new Promise((resolve, reject) => {
        let whereStatement: string;
        if (keys && keys.length) {
            const innerKeys = keys.join("','");
            whereStatement = `where key IN ('${innerKeys}')`;
        }
        console.log(predictionsSelect + " " + whereStatement);
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
            const innerKeys = raceKeys.join("','");
            statement = `${racePredictionSelect} WHERE race in ('${innerKeys}')`;
            console.log(statement);
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

export function deleteRacePredictions(race: string, keys: string[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const joinedKeys = keys.join("','");
        const deleteStatement = `DELETE FROM racepredictions WHERE 
        race == '${race}' && prediction in ('${joinedKeys}')`;

        db.run(deleteStatement, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}

export function updateRacePredictions(race: string, updates: DbRacePrediction[]): Promise<boolean> {
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

                    for (const racePrediction of updates) {
                        const valuesObject = {
                            1: racePrediction.prediction,
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

export function updatePredictions(predictions: PredictionResponse[]): Promise<boolean> {
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
    race: string;
    prediction: string;
    modifier: number;
    value: number;
}

export interface DbUserPick {
    user: string;
    race: string;
    choice: string;
    prediction: string;
}