import * as sqlite3 from "sqlite3";
import { RaceResponse } from "../../../common/models/Race";

const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

const raceSelect = "select * from races_vw";

export function getRaces(season: number, key?: string): Promise<RaceResponse[]> {
    return new Promise((resolve, reject) => {
        let selectStatement = `${raceSelect} where season = ${season}`;
        let whereStatement = "";
        if (key) {
            whereStatement = "and key = '" + key + "'";
        }
        db.all(`${selectStatement} ${whereStatement}`, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            for (const row of rows) {
                if (row.trivia) {
                    row.trivia = JSON.parse(row.trivia);
                }
            }
            resolve(rows);
        });
    });
}

export function saveRaces(season, races: RaceResponse[]): Promise<boolean> {
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
                    races.forEach(race => {
                        let valuesObject = {
                            1: race.key,
                            2: race.track,
                            3: season,
                            4: race.trivia ? JSON.stringify(race.trivia) : null,
                            5: race.cutoff,
                            6: race.raceDate,
                            7: race.qualiDate,
                            8: race.winner,
                            9: race.displayName,
                            10: race.laps ? race.laps : 0
                        };
                        db.run(insert, valuesObject);
                    });
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