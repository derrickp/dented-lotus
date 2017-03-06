<<<<<<< HEAD
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database('app/Data/formulawednesday.sqlite');
var driverSelect = "SELECT * from drivers_vw";
function saveDrivers(drivers) {
    return new Promise(function (resolve, reject) {
        try {
            var insert_1 = "INSERT OR REPLACE INTO drivers (key, active, name, teamkey, trivia) VALUES (?1, ?2, ?3, ?4, ?5)";
            db.serialize(function () {
                db.exec("BEGIN;");
                drivers.forEach(function (driver) {
                    var valuesObject = {
                        1: driver.key,
                        2: driver.active ? 1 : 0,
                        3: driver.name,
                        4: driver.teamKey,
                        5: driver.trivia ? JSON.stringify(driver.trivia) : ""
                    };
                    db.run(insert_1, valuesObject);
                });
                db.exec("COMMIT;");
                resolve(true);
            });
        }
        catch (exception) {
            console.log(exception);
            db.exec("ROLLBACK;");
            reject(exception);
        }
    });
}
exports.saveDrivers = saveDrivers;
function getDrivers(active, key) {
    return new Promise(function (resolve, reject) {
        var whereStatement;
        if (active) {
            whereStatement = "where active = 1";
        }
        else {
            whereStatement = "where active >= 0";
        }
        if (key) {
            whereStatement = whereStatement + " and key = '" + key + "'";
        }
        console.log(driverSelect + " " + whereStatement);
        db.all(driverSelect + " " + whereStatement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            rows.forEach(function (row) {
                if (row.active) {
                    row.active = true;
                }
                else {
                    row.active = false;
                }
            });
            resolve(rows);
        });
    });
}
exports.getDrivers = getDrivers;
;
=======
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database('app/Data/formulawednesday.sqlite');
var driverSelect = "SELECT * from drivers_vw";
function saveDrivers(drivers) {
    return new Promise(function (resolve, reject) {
        try {
            var insert_1 = "INSERT OR REPLACE INTO drivers (key, active, name, teamkey, trivia) VALUES (?1, ?2, ?3, ?4, ?5)";
            db.serialize(function () {
                db.exec("BEGIN;");
                drivers.forEach(function (driver) {
                    var valuesObject = {
                        1: driver.key,
                        2: driver.active ? 1 : 0,
                        3: driver.name,
                        4: driver.teamKey,
                        5: driver.trivia ? JSON.stringify(driver.trivia) : ""
                    };
                    db.run(insert_1, valuesObject);
                });
                db.exec("COMMIT;");
                resolve(true);
            });
        }
        catch (exception) {
            console.log(exception);
            db.exec("ROLLBACK;");
            reject(exception);
        }
    });
}
exports.saveDrivers = saveDrivers;
function getDrivers(active, key) {
    return new Promise(function (resolve, reject) {
        var whereStatement;
        if (active) {
            whereStatement = "where active = 1";
        }
        else {
            whereStatement = "where active >= 0";
        }
        if (key) {
            whereStatement = whereStatement + " and key = '" + key + "'";
        }
        console.log(driverSelect + " " + whereStatement);
        db.all(driverSelect + " " + whereStatement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            rows.forEach(function (row) {
                if (row.active) {
                    row.active = true;
                }
                else {
                    row.active = false;
                }
            });
            resolve(rows);
        });
    });
}
exports.getDrivers = getDrivers;
;
>>>>>>> ca5403d00e88d7653aeba85d1c6e713457ad0b11
