
import * as sqlite3 from "sqlite3";

import { PredictionResponse, PredictionTypes, ModifierResponse } from "../../../common/responses/PredictionResponse";
import { RacePrediction } from "../../../common/models/Race";
import { getDriverResponses } from "./drivers";
import { getTeamResponses } from "./teams";

const db = new sqlite3.Database('app/Data/' + process.env.DBNAME);

const predictionsSelect = "select * from predictions_vw";
const racePredictionSelect = "select * from racepredictions_vw";
const userPicksSelect = "select * from userpicks_vw";
const modifierSelect = "select choice, modifier from modifiers"

export async function getPredictionResponses(raceKeys: string[], userKey: string): Promise<PredictionResponse[]> {
    const predictionResponses: PredictionResponse[] = [];
    const racePredictionRows = await getRacePredictions(raceKeys);
    const predictionKeys = racePredictionRows.filter(rp => rp.prediction).map(rp => rp.prediction);
    const predictions = await getPredictions(predictionKeys);
    const userPicks = await getUserPicks(userKey, raceKeys);
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
            description: thisPrediction.description,
            title: thisPrediction.title,
            type: thisPrediction.type,
            outcome: [],
            userPick: "",
            raceKey: racePredictionRow.race
        };

        // Get all of the user picks for this prediction
        prediction.userPick = userPicks.filter(up => {
            return up.prediction === prediction.key;
        }).map(up => {
            return up.choice;
        })[0];
        predictionResponses.push(prediction);
    }

    return predictionResponses;
}

export async function getModifiers(raceKey: string, predictionKey: string): Promise<ModifierResponse[]> {
    const modifierResponses: ModifierResponse[] = [];
    if (!raceKey || !predictionKey) {
        return modifierResponses;
    }
    return new Promise<ModifierResponse[]>((resolve, reject) => {
        let statement = modifierSelect + ` where race = '${raceKey}' AND prediction = '${predictionKey}' order by choice asc`;
        db.all(statement, (err, rows: ModifierResponse[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function savePredictionModifiers(prediction: string, race: string, modifiers: ModifierResponse[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        if (!prediction || !race) {
            reject(new Error("need race key and prediction key"));
            return;
        }
        const deleteStatement = `DELETE FROM modifiers where race == '${race}' AND prediction == '${prediction}'`
        db.run(deleteStatement, (err) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const insert = `INSERT OR REPLACE INTO modifiers
            (race, prediction, choice, modifier)
            VALUES (?1, ?2, ?3, ?4);`;
                db.serialize(() => {
                    db.exec("BEGIN;", (beginError) => {
                        if (beginError) {
                            reject(beginError);
                            return;
                        }
                        for (const modifier of modifiers) {
                            const valuesObject = {
                                1: race,
                                2: prediction,
                                3: modifier.choice,
                                4: modifier.modifier
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
                console.error(exception);
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
        db.all(statement, (err, rows: DbUserPick[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function getAllSeasonValues(): Promise<RacePrediction[]> {
    return new Promise((resolve, reject) => {
        const statement = `${racePredictionSelect} where race == '2017-season'`;
        db.all(statement, (err, rows: RacePrediction[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function getAllSeasonPredictions(): Promise<PredictionResponse[]> {
    return new Promise((resolve: (predictions: PredictionResponse[]) => void, reject: (error: Error) => void) => {
        const statement = `${predictionsSelect} where allseason == 1`
        db.all(statement, (err, rows: DbBasePrediction[]) => {
            if (err) {
                reject(err);
                return;
            }
            const predictions: PredictionResponse[] = [];
            for (const row of rows) {
                const prediction: PredictionResponse = {
                    key: row.key,
                    allSeason: row.allSeason != 0 ? true : false,
                    title: row.title,
                    description: row.description,
                    type: row.type
                };
                predictions.push(prediction);
            }
            resolve(predictions);
            return;
        });
    });
}

export function getPredictions(keys?: string[]): Promise<PredictionResponse[]> {
    return new Promise((resolve: (predictions: PredictionResponse[]) => void, reject: (error: Error) => void) => {
        let whereStatement: string;
        if (keys && keys.length) {
            const innerKeys = keys.join("','");
            whereStatement = `where key IN ('${innerKeys}')`;
        }
        db.all(predictionsSelect + " " + whereStatement, (err, rows: DbBasePrediction[]) => {
            if (err) {
                reject(err);
                return;
            }
            const predictions: PredictionResponse[] = [];
            for (const row of rows) {
                const prediction: PredictionResponse = {
                    key: row.key,
                    allSeason: row.allSeason != 0 ? true : false,
                    title: row.title,
                    description: row.description,
                    type: row.type
                };
                predictions.push(prediction);
            }
            resolve(predictions);
            return;
        });
    });
}

export function getPredictionsForRace(raceKey: string): Promise<RacePrediction[]> {
    return new Promise<RacePrediction[]>((resolve, reject) => {
        let statement: string = `${racePredictionSelect} WHERE race = '${raceKey}'`;
        db.all(statement, (err, rows: RacePrediction[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
            return;
        });
    });
}

export function getRacePredictions(raceKeys?: string[]): Promise<RacePrediction[]> {
    return new Promise<RacePrediction[]>((resolve, reject) => {
        let statement: string;
        if (raceKeys && raceKeys.length) {
            const innerKeys = raceKeys.join("','");
            statement = `${racePredictionSelect} WHERE race in ('${innerKeys}')`;
        }
        else {
            statement = racePredictionSelect;
        }
        db.all(statement, (err, rows: RacePrediction[]) => {
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
            console.error(exception);
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

export function updateRacePredictions(race: string, updates: RacePrediction[]): Promise<boolean> {
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
                            3: racePrediction.value
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
            console.error(exception);
            db.exec("ROLLBACK;");
            reject(exception);
        }
    });
}

export function updatePredictions(predictions: PredictionResponse[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const insert = `INSERT OR REPLACE INTO predictions
            (key, description, title, type, allseason) 
            VALUES (?1, ?2, ?3, ?4, ?5)`;
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
                            5: prediction.allSeason ? 1 : 0
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
            console.error(exception);
            db.exec("ROLLBACK;");
            reject(exception);
        }
    });
}

export interface DbBasePrediction {
    key: string;
    description: string;
    title: string;
    type: string;
    allSeason: number;
}

export interface DbUserPick {
    user: string;
    race: string;
    choice: string;
    prediction: string;
}