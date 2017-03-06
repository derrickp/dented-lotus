'use strict';

import * as sqlite3 from "sqlite3";
import { Track } from "../models/Track";
import { getDrivers } from "./data/drivers";

const formatString = require('format-string');
const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

const allChallengesSelect = "SELECT * from challenges";

const driverSelect = "SELECT drivers.key, drivers.active, drivers.name, drivers.points, drivers.teamkey as teamKey, teams.name as teamName FROM drivers inner join teams on drivers.teamKey == teams.key";
const raceSelect = "select r.*, s.cutoff, s.racedate as raceDate, s.scored from races as r inner join seasons as s on r.key == s.racekey";
const trackSelect = "select * from tracks_vw";
const challengeSelect = "select c.*, ac.racekey as raceKey from challenges as c inner join activechallenges as ac on c.key == ac.challengekey";
const basicUserSelect = "select users.displayname as displayName, users.firstname as firstName, users.key, users.points from users";
const userSelectNoPass = "select users.displayname as displayName, users.email, users.firstname as firstName, users.key, users.lastname as lastName, users.role, users.points from users";
const userChoiceSelect = "select userchoices.challengeKey as key, userchoices.choice as value from userchoices";
const userInsert = "INSERT INTO users (key, email, displayname, firstname, lastname, role, points)";
const userSelect = "select users.displayname as displayName, users.email, users.firstname as firstName, users.key, users.lastname as lastName, users.role, users.points from users";
const blogQuery = "select blogs.message, blogs.title, blogs.userkey as userKey, blogs.postdate as postDate from blogs";
const topMessage = "select * from messageoftherace order by created_date DESC LIMIT 1 ";

const userChoicesInsert = "INSERT OR REPLACE INTO userchoices (userkey, season, racekey, challengekey, choice)";
const addRadioMessage = "INSERT OR REPLACE INTO messageoftherace (image_url, message, created_by, created_date, season_id, race_id)";

export function getLatestRadioMessage(): Promise<string> {
    return new Promise((resolve,reject)=>{    
        let statement = topMessage;
        db.all(statement, (err,rows)=>{
            if (err){
                reject(err);
            }
            resolve(rows[0]);
        });
    });
}

export function getTracks(key: number): Promise<Track[]> {
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

export function addNewRadioMessage(newMessage): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            let insertStatement = addRadioMessage + " VALUES (?1, ?2, ?3, ?4, ?5, ?6);";
            db.serialize(() => {
                db.exec("BEGIN;");
                    let valuesObject = {
                        1: newMessage.image_url,
                        2: encodeURIComponent(newMessage.message),
                        3: newMessage.created_by,
                        4: newMessage.created_date,
                        5: newMessage.season_id,
                        6: newMessage.race_id
                    };
                    db.run(insertStatement, valuesObject);
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

export function getBlogs(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let statement = blogQuery;
        db.all(statement, (err, rows) => {
           if (err) {
               reject(err);
               return;
           }
           resolve(rows);
        });     
    });
}

export function getRaces(season, key): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let whereStatement = "";
        if (key) {
            whereStatement = "where key = '" + key + "'";
        }
        db.all(raceSelect + " " + whereStatement, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            rows.forEach(row => {
                row.scored = !!row.scored;
            });
            resolve(rows);
        });
    });
};

export function getUsers(email): Promise<any[]> {
	return new Promise((resolve, reject) => {
		let statement = userSelect;
		if (email) {
			statement = statement + " where users.email = '" + email + "'";
		}
		db.all(statement, (err, rows) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(rows);
		});
	});	
}

export function getFullUsers(key): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let statement = userSelectNoPass;
        if (key) {
            statement = statement + " where users.key = '" + key + "'";
        }
        db.all(statement, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function getBasicUsers(key): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let statement = basicUserSelect;
        if (key) {
            statement = statement + " where users.key = '" + key + "'";
        }
        db.all(statement, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function deleteUser(key): Promise<boolean> {
    return new Promise((resolve, reject) => {
        let deleteStatement = "DELETE FROM users where key = '" + key + "'";
        db.run(deleteStatement, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}

export function saveUser(user): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!user) {
            reject(new Error("must have a user to save"));
            return;
        }

        let valuesStatement = "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7);";
        let valuesObject = {
            1: user.key,
            2: user.email,
            3: user.displayName ? user.displayName : "",
            4: user.firstName ? user.firstName : "",
            5: user.lastName ? user.lastName : "",
            6: user.role,
            7: user.points ? user.points : 0
        };
        var insertStatement = userInsert + " " + valuesStatement;
        db.run(insertStatement, valuesObject, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}

export function updateUser(user): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!user) {
            reject(new Error("must have a user to update"));
            return;
        }
        let updateStatement = "UPDATE users SET ";
        let updateFields = [];
        let updateObject = {};
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

        let fieldStatement = updateFields.join(",");
        updateStatement += fieldStatement;
        let where = " WHERE key = ?7";
        updateObject[7] = user.key;
        updateStatement += where;
        db.run(updateStatement, updateObject, (err) => {
            if (err) {
                reject(err);
                return;
            }
            getFullUsers(user.key).then(users => {
                let newUser = users[0];
                if (!newUser) {
                    reject("could not find user in database");
                    return;
                }
                resolve(newUser);
            });
        });
    });
}

export function getChallenges(raceKey, challengeKey): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let driverPromise = getDrivers(true);
        let challengePromise = _getChallengesInternal(raceKey);
        let challengeChoiceMapsPromise = _getChallengeChoicesInternal(raceKey);
        Promise.all([driverPromise, challengePromise, challengeChoiceMapsPromise]).then((results) => {
            let challenges = results[1];
            let drivers = results[0];
            let challengeChoiceMaps = results[2];
            challenges.forEach(challenge => {
                var challengeChoiceMap = challengeChoiceMaps.filter(map => { return map.challengeKey === challenge.key; })[0];
                if (!challengeChoiceMap) {
                    challenge.driverChoices = drivers.slice(0);
                }
                else {
                    challenge.driverChoices = drivers.filter(driver => {
                        return challengeChoiceMap.drivers.some(dk => { return dk === driver.key; })
                    });
                }
            });
            if (!challenges) {
                reject(new Error("internal error while retrieving challenges"));
            }
            resolve(challenges);
        });
    });
};

export function getUserPicks(userKey, season, raceKey, challengeKey) {
    return new Promise((resolve, reject) => {
        let statement = userChoiceSelect + " where userkey = ?1 and season = ?2 and racekey = ?3";
        let valuesObject = {
            1: userKey,
            2: season,
            3: raceKey
        };
        if (challengeKey) {
            statement = statement + " and challengekey = ?4";
            valuesObject[4] = challengeKey;
        }
        db.all(statement, valuesObject, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function getAllChallenges() {
    return new Promise((resolve, reject) => {
        db.all(allChallengesSelect, function(err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function saveUserPicks(userPicks) {
    return new Promise((resolve, reject) => {
        try {
            let insertStatement = userChoicesInsert + " VALUES (?1, ?2, ?3, ?4, ?5);";
            db.serialize(() => {
                db.exec("BEGIN;");
                
                for (let i = 0; i < userPicks.length; i++) {
                    let userPick = userPicks[i];
                    let valuesObject = {
                        1: userPick.userKey,
                        2: userPick.season,
                        3: userPick.raceKey,
                        4: userPick.challengeKey,
                        5: userPick.choice  
                    };
                    db.run(insertStatement, valuesObject);
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

function _getChallengesInternal(raceKey): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let where: string;
        if (raceKey) {
            where = "where ac.racekey = '" + raceKey + "'";
        }
        db.all(challengeSelect + " " + where, function (err, rows) {
            resolve(rows);
        });
    });
};

function _getChallengeChoicesInternal(raceKey): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let statement = "select distinct challengechoices.challengekey as challengeKey, " + 
        "challengechoices.season, challengechoices.racekey as raceKey, challengechoices.driverkey as driverKey " +
        "from challengechoices inner join activechallenges as ac on challengechoices.challengeKey == ac.challengekey where " +
        "challengechoices.raceKey == '" + raceKey + "'";
        let challengeChoiceMaps = [];
        db.all(statement, (err, rows) => {
            rows.forEach(row => {
                let challengeChoiceMap = challengeChoiceMaps.filter(value => { return value.challengeKey === row.challengeKey; })[0];
                if (challengeChoiceMap) {
                    challengeChoiceMap.drivers.push(row.driverKey);
                }
                else {
                    let challengeChoiceMap = {
                        challengeKey: row.challengeKey,
                        drivers: []
                    };
                    challengeChoiceMap.drivers.push(row.driverKey);
                    challengeChoiceMaps.push(challengeChoiceMap);
                }
            });
            resolve(challengeChoiceMaps);
        });
    });
}