"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database('app/Data/formulawednesday.sqlite');
var trackSelect = "SELECT * from tracks_vw";
function saveTracks(tracks) {
    return new Promise(function (resolve, reject) {
        try {
            var insert_1 = "INSERT OR REPLACE INTO tracks (key, name, country, title, latitude, longitude, trivia, tracklength, description) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)";
            db.serialize(function () {
                db.exec("BEGIN;", function (beginError) {
                    if (beginError) {
                        reject(beginError);
                        return;
                    }
                    tracks.forEach(function (track) {
                        var valuesObject = {
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
                        db.run(insert_1, valuesObject);
                    });
                    db.exec("COMMIT;", function (err) {
                        if (err) {
                            reject(err);
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
exports.saveTracks = saveTracks;
function getTracks(key) {
    return new Promise(function (resolve, reject) {
        var statement = trackSelect;
        db.all(statement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
exports.getTracks = getTracks;
