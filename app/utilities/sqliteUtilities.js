'use strict';
var sqlite3 = require("sqlite3");
var formatString = require('format-string');
var db = new sqlite3.Database('app/Data/formulawednesday.sqlite');
var allChallengesSelect = "SELECT * from challenges";
var driverSelect = "SELECT drivers.key, drivers.active, drivers.name, drivers.points, drivers.teamkey as teamKey, teams.name as teamName FROM drivers inner join teams on drivers.teamKey == teams.key";
var raceSelect = "select r.*, s.cutoff, s.racedate as raceDate, s.scored from races as r inner join seasons as s on r.key == s.racekey";
var challengeSelect = "select c.*, ac.racekey as raceKey from challenges as c inner join activechallenges as ac on c.key == ac.challengekey";
var basicUserSelect = "select users.displayname as displayName, users.firstname as firstName, users.key, users.points from users";
var userSelectNoPass = "select users.displayname as displayName, users.email, users.firstname as firstName, users.key, users.lastname as lastName, users.role, users.points from users";
var userChoiceSelect = "select userchoices.challengeKey as key, userchoices.choice as value from userchoices";
var userInsert = "INSERT INTO users (key, email, pass, displayname, firstname, lastname, role, points)";
var userSelect = "select users.displayname as displayName, users.email, users.firstname as firstName, users.key, users.lastname as lastName, users.role, users.pass, users.points from users";
var blogQuery = "select blogs.message, blogs.title, blogs.userkey as userKey, blogs.postdate as postDate from blogs";
var topMessage = "select * from messageoftherace order by created_date DESC LIMIT 1 ";
var userChoicesInsert = "INSERT OR REPLACE INTO userchoices (userkey, season, racekey, challengekey, choice)";
var addRadioMessage = "INSERT OR REPLACE INTO messageoftherace (image_url, message, created_by, created_date, season_id, race_id)";
function getLatestRadioMessage() {
    return new Promise(function (resolve, reject) {
        var statement = topMessage;
        db.all(statement, function (err, rows) {
            if (err) {
                reject(err);
            }
            resolve(rows[0]);
        });
    });
}
exports.getLatestRadioMessage = getLatestRadioMessage;
function addNewRadioMessage(newMessage) {
    return new Promise(function (resolve, reject) {
        try {
            var insertStatement_1 = addRadioMessage + " VALUES (?1, ?2, ?3, ?4, ?5, ?6);";
            db.serialize(function () {
                db.exec("BEGIN;");
                var valuesObject = {
                    1: newMessage.image_url,
                    2: encodeURIComponent(newMessage.message),
                    3: newMessage.created_by,
                    4: newMessage.created_date,
                    5: newMessage.season_id,
                    6: newMessage.race_id
                };
                db.run(insertStatement_1, valuesObject);
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
exports.addNewRadioMessage = addNewRadioMessage;
function getBlogs() {
    return new Promise(function (resolve, reject) {
        var statement = blogQuery;
        db.all(statement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
exports.getBlogs = getBlogs;
function getDrivers(active, key) {
    return new Promise(function (resolve, reject) {
        var whereStatement = "";
        if (active) {
            whereStatement = "where active = 1";
        }
        else {
            whereStatement = "where active >= 0";
        }
        if (key) {
            whereStatement = "and key = '" + key + "'";
        }
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
function getRaces(season, key) {
    return new Promise(function (resolve, reject) {
        var whereStatement = "";
        if (key) {
            whereStatement = "where key = '" + key + "'";
        }
        db.all(raceSelect + " " + whereStatement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            rows.forEach(function (row) {
                row.scored = !!row.scored;
            });
            resolve(rows);
        });
    });
}
exports.getRaces = getRaces;
;
function getUsers(email, withPassword) {
    return new Promise(function (resolve, reject) {
        var statement = userSelect;
        if (email) {
            statement = statement + " where users.email = '" + email + "'";
        }
        db.all(statement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
exports.getUsers = getUsers;
function getFullUsers(key) {
    return new Promise(function (resolve, reject) {
        var statement = userSelectNoPass;
        if (key) {
            statement = statement + " where users.key = '" + key + "'";
        }
        db.all(statement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
exports.getFullUsers = getFullUsers;
function getBasicUsers(key) {
    return new Promise(function (resolve, reject) {
        var statement = basicUserSelect;
        if (key) {
            statement = statement + " where users.key = '" + key + "'";
        }
        db.all(statement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
exports.getBasicUsers = getBasicUsers;
function deleteUser(key) {
    return new Promise(function (resolve, reject) {
        var deleteStatement = "DELETE FROM users where key = '" + key + "'";
        db.run(deleteStatement, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}
exports.deleteUser = deleteUser;
function saveUser(user) {
    return new Promise(function (resolve, reject) {
        if (!user) {
            reject(new Error("must have a user to save"));
            return;
        }
        var valuesStatement = "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8);";
        var valuesObject = {
            1: user.key,
            2: user.email,
            3: user.password,
            4: user.displayName ? user.displayName : "",
            5: user.firstName ? user.firstName : "",
            6: user.lastName ? user.lastName : "",
            7: user.role,
            8: user.points ? user.points : 0
        };
        var insertStatement = userInsert + " " + valuesStatement;
        db.run(insertStatement, valuesObject, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}
exports.saveUser = saveUser;
function updateUser(user) {
    return new Promise(function (resolve, reject) {
        if (!user) {
            reject(new Error("must have a user to update"));
            return;
        }
        var updateStatement = "UPDATE users SET ";
        var updateFields = [];
        var updateObject = {};
        if (user.displayName) {
            updateFields.push("displayname = ?1");
            updateObject[1] = user.displayName;
        }
        if (user.firstName) {
            updateFields.push("firstname = ?2");
            updateObject[2] = user.firstName;
        }
        if (user.lastName) {
            updateFields.push("lastname = ?3");
            updateObject[3] = user.lastName;
        }
        if (user.role) {
            updateFields.push("role = ?4");
            updateObject[4] = user.role;
        }
        if (user.points) {
            updateFields.push("points = ?5");
            updateObject[5] = user.points;
        }
        if (user.password) {
            updateFields.push("pass = ?6");
            updateObject[6] = user.password;
        }
        if (!updateFields.length) {
            reject("nothing to update");
        }
        var fieldStatement = updateFields.join(",");
        updateStatement += fieldStatement;
        var where = " WHERE key = ?7";
        updateObject[7] = user.key;
        updateStatement += where;
        db.run(updateStatement, updateObject, function (err) {
            if (err) {
                reject(err);
                return;
            }
            getFullUsers(user.key).then(function (users) {
                var newUser = users[0];
                if (!newUser) {
                    reject("could not find user in database");
                    return;
                }
                resolve(newUser);
            });
        });
    });
}
exports.updateUser = updateUser;
function getChallenges(season, raceKey, challengeKey) {
    return new Promise(function (resolve, reject) {
        if (!season) {
            reject(new Error("Need a season and a race key"));
            return;
        }
        var driverPromise = getDrivers(true);
        var challengePromise = _getChallengesInternal(season, raceKey);
        var challengeChoiceMapsPromise = _getChallengeChoicesInternal(season, raceKey);
        Promise.all([driverPromise, challengePromise, challengeChoiceMapsPromise]).then(function (results) {
            var challenges = results[1];
            var drivers = results[0];
            var challengeChoiceMaps = results[2];
            challenges.forEach(function (challenge) {
                var challengeChoiceMap = challengeChoiceMaps.filter(function (map) { return map.challengeKey === challenge.key; })[0];
                if (!challengeChoiceMap) {
                    challenge.driverChoices = drivers.slice(0);
                }
                else {
                    challenge.driverChoices = drivers.filter(function (driver) {
                        return challengeChoiceMap.drivers.some(function (dk) { return dk === driver.key; });
                    });
                }
            });
            if (!challenges) {
                reject(new Error("internal error while retrieving challenges"));
            }
            resolve(challenges);
        });
    });
}
exports.getChallenges = getChallenges;
;
function getUserPicks(userKey, season, raceKey, challengeKey) {
    return new Promise(function (resolve, reject) {
        var statement = userChoiceSelect + " where userkey = ?1 and season = ?2 and racekey = ?3";
        var valuesObject = {
            1: userKey,
            2: season,
            3: raceKey
        };
        if (challengeKey) {
            statement = statement + " and challengekey = ?4";
            valuesObject[4] = challengeKey;
        }
        db.all(statement, valuesObject, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
exports.getUserPicks = getUserPicks;
function getAllChallenges() {
    return new Promise(function (resolve, reject) {
        db.all(allChallengesSelect, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
exports.getAllChallenges = getAllChallenges;
function saveUserPicks(userPicks) {
    return new Promise(function (resolve, reject) {
        try {
            var insertStatement_2 = userChoicesInsert + " VALUES (?1, ?2, ?3, ?4, ?5);";
            db.serialize(function () {
                db.exec("BEGIN;");
                for (var i = 0; i < userPicks.length; i++) {
                    var userPick = userPicks[i];
                    var valuesObject = {
                        1: userPick.userKey,
                        2: userPick.season,
                        3: userPick.raceKey,
                        4: userPick.challengeKey,
                        5: userPick.choice
                    };
                    db.run(insertStatement_2, valuesObject);
                }
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
exports.saveUserPicks = saveUserPicks;
function _getChallengesInternal(season, raceKey) {
    return new Promise(function (resolve, reject) {
        var where = "where ac.season = " + season;
        if (raceKey) {
            where = where + " and ac.racekey = '" + raceKey + "'";
        }
        db.all(challengeSelect + " " + where, function (err, rows) {
            resolve(rows);
        });
    });
}
;
function _getChallengeChoicesInternal(season, raceKey) {
    return new Promise(function (resolve, reject) {
        var statement = "select distinct challengechoices.challengekey as challengeKey, " +
            "challengechoices.season, challengechoices.racekey as raceKey, challengechoices.driverkey as driverKey " +
            "from challengechoices inner join activechallenges as ac on challengechoices.challengeKey == ac.challengekey where " +
            "challengechoices.season == " + season + " and challengechoices.raceKey == '" + raceKey + "'";
        var challengeChoiceMaps = [];
        db.all(statement, function (err, rows) {
            rows.forEach(function (row) {
                var challengeChoiceMap = challengeChoiceMaps.filter(function (value) { return value.challengeKey === row.challengeKey; })[0];
                if (challengeChoiceMap) {
                    challengeChoiceMap.drivers.push(row.driverKey);
                }
                else {
                    var challengeChoiceMap_1 = {
                        challengeKey: row.challengeKey,
                        drivers: []
                    };
                    challengeChoiceMap_1.drivers.push(row.driverKey);
                    challengeChoiceMaps.push(challengeChoiceMap_1);
                }
            });
            resolve(challengeChoiceMaps);
        });
    });
}
