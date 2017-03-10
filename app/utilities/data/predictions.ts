
import * as sqlite3 from "sqlite3";

import { PredictionResponse, RacePredictionResponse } from "../../../common/models/Prediction";

const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

export const predictionsSelect = "select * from predictions_vw";
export const racePredictionSelect = "select * from racepredictions_vw";

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

export function getRacePredictions(race: string): Promise<RacePredictionResponse[]> {
    return new Promise<RacePredictionResponse[]>((resolve, reject) => {
        db.all(racePredictionSelect, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
            return;
        });
    });
}

export function saveRacePredictions(race: string, racePredictions: RacePredictionResponse[]): Promise<boolean> {
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