import * as sqlite3 from "sqlite3";
import { RaceResponse } from "../../../common/models/Race";

const db = new sqlite3.Database('app/Data/' + process.env.DBNAME);

const raceSelect = "select * from races_vw";

export interface DbRace {
    displayName?: string;
    raceDate?: string;
    qualiDate?: string;
    season?: number;
    key: string;
    laps?: number;
    track: string;
    trivia?: string;
    cutoff?: string;
    winner?: string;
    info?: string;
}

export function getRaces(season: number, keys?: string[]): Promise<DbRace[]> {
    return new Promise<DbRace[]>((resolve, reject) => {
        let selectStatement = `${raceSelect} where season = ${season}`;
        let whereStatement = "";
        if (keys && keys.length) {
            const innerKeys = keys.join("','");
            whereStatement = " and key IN ('" + innerKeys + "')";
        }
        db.all(`${selectStatement} ${whereStatement}`, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export async function saveRaces(season, newRaces: RaceResponse[]): Promise<boolean> {
    const raceKeys = newRaces.filter(r => r.key).map(r => r.key);
    const existingRaces = await getRaces(season, raceKeys);
    return new Promise<boolean>((resolve, reject) => {
        try {
            const insert = `INSERT OR REPLACE INTO races 
            (key, trackkey, season, trivia, cutoff, racedate, qualidate, winner, displayname, laps) 
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`;
            db.serialize(() => {
                db.exec("BEGIN;", (beginError: Error) => {
                    if (beginError) {
                        reject(beginError);
                        return;
                    }
                    for (const race of newRaces) {
                        const existingRace = existingRaces.filter(r => {
                            r.key === race.key;
                        })[0];
                        const values = {
                            1: race.key
                        };
                        // track
                        if (race.track) {
                            values[2] = race.track.key;
                        }
                        else {
                            values[2] = existingRace ? existingRace.track : null;
                        }
                        // season
                        values[3] = season;
                        // trivia
                        if (race.trivia) {
                            values[4] = JSON.stringify(race.trivia);
                        }
                        else {
                            values[4] = existingRace ? existingRace.trivia : JSON.stringify([]);
                        }
                        // cutoff
                        if (race.cutoff) {
                            values[5] = race.cutoff;
                        }
                        else {
                            values[5] = existingRace ? existingRace.cutoff : null;
                        }
                        // raceDate
                        if (race.raceDate) {
                            values[6] = race.raceDate;
                        }
                        else {
                            values[6] = existingRace ? existingRace.raceDate : null;
                        }
                        // qualiDate
                        if (race.qualiDate) {
                            values[7] = race.qualiDate;
                        }
                        else {
                            values[7] = existingRace ? existingRace.qualiDate : null;
                        }
                        // winner
                        if (race.winner && race.winner.key) {
                            values[8] = race.winner.key;
                        }
                        else {
                            values[8] = existingRace ? existingRace.winner : null;
                        }
                        // displayName
                        if (race.displayName) {
                            values[9] = race.displayName;
                        }
                        else {
                            values[9] = existingRace ? existingRace.displayName : null;
                        }
                        // laps
                        if (race.laps) {
                            values[10] = race.laps;
                        }
                        else {
                            values[10] = existingRace ? existingRace.laps : null;
                        }
                        db.run(insert, values);
                    }
                    db.exec("COMMIT;", (err: Error) => {
                        if (err) {
                            reject(err);
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