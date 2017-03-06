import * as sqlite3 from "sqlite3";
import { Track } from "../../../common/models/Track";

const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

const trackSelect = "SELECT * from tracks_vw";

export function saveTracks(tracks: Track[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const insert = "INSERT OR REPLACE INTO tracks (key, name, country, title, latitude, longitude, trivia, tracklength, description) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)";
            db.serialize(() => {
                db.exec("BEGIN;", (beginError: Error) => {
                    if (beginError) {
                        reject(beginError);
                        return;
                    }
                    tracks.forEach(track => {
                        let valuesObject = {
                            1: track.key,
                            2: track.name,
                            3: track.country,
                            4: track.title,
                            5: track.latitude,
                            6: track.longitude,
                            7: track.trivia ? JSON.stringify(track.trivia) : "",
                            8: track.length,
                            9: track.description
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

export function getTracks(key?: string): Promise<Track[]> {
    return new Promise<Track[]>((resolve, reject) => {
        let statement = trackSelect;
        db.all(statement, (err, rows: Track[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}