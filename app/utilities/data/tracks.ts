import * as sqlite3 from "sqlite3";
import { TrackResponse } from "../../../common/models/Track";

const db = new sqlite3.Database('app/Data/' + process.env.DBNAME);

const trackSelect = "SELECT * from tracks_vw";

export async function getTrackResponses(keys?: string[]): Promise<TrackResponse[]> {
    const trackRows = await getTracks(keys);
    const tracks: TrackResponse[] = [];
    for (const trackRow of trackRows) {
        const track: TrackResponse = {
            key: trackRow.key,
            latitude: trackRow.latitude,
            longitude: trackRow.longitude,
            name: trackRow.name,
            country: trackRow.country,
            trivia: trackRow.trivia ? JSON.parse(trackRow.trivia) : [],
            length: trackRow.length,
            title: trackRow.title,
            info:trackRow.info,
            image:trackRow.image
        };
        tracks.push(track);
    }
    return tracks;
}

export function saveTracks(tracks: TrackResponse[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const insert = "INSERT OR REPLACE INTO tracks (key, name, country, title, latitude, longitude, trivia, tracklength, description, info) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)";
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
                            9: track.description,
                            10:track.info
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

export function getTracks(keys?: string[]): Promise<DbTrack[]> {
    return new Promise<DbTrack[]>((resolve, reject) => {
        let statement = trackSelect;
        
        if (keys && keys.length) {
            const innerKeys = keys.join("','");
            statement = statement + ` where key IN ('${innerKeys}')`
        }
        db.all(statement, (err, rows: DbTrack[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export interface DbTrack {
    key: string;
    name: string;
    country: string;
    length: number;
    title: string;
    trivia?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    info?:string;
    image?:string;
}