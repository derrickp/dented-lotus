import * as sqlite3 from "sqlite3";

import { UserResponse } from "../../../common/models/User";
const db = new sqlite3.Database('app/Data/' + process.env.DBNAME);

const userSelect = "select * from full_user_vw";
const allPublicUsersSelect = "select * from public_users_vw";

const userInsert = "INSERT INTO users (key, email, displayname, firstname, lastname, role, points, imageurl)";

export function getUsersByEmail(emails?: string[]): Promise<UserResponse[]> {
	return new Promise<UserResponse[]>((resolve, reject) => {
		let statement = userSelect;
		if (emails && emails.length) {
            const innerEmails = emails.join("','");
			statement = statement + ` where email IN ('${innerEmails}')`;
		}
		db.all(statement, (err, rows: UserResponse[]) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(rows);
		});
	});	
}

export function getFullUsers(keys?: string[]): Promise<UserResponse[]> {
    return new Promise((resolve, reject) => {
        let statement = userSelect;
        if (keys && keys.length > 0) {
            const innerKeys = keys.join("','");
            statement = statement + ` where key IN ('${innerKeys}')`;
        }
        db.all(statement, (err, rows: UserResponse[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function getAllPublicUsers(): Promise<UserResponse[]> {
    return new Promise((resolve, reject) => {
        let statement = allPublicUsersSelect; 
        db.all(statement, (err, rows: UserResponse[]) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export function getUsersByKeys(keys: string[]): Promise<UserResponse[]> {
    return new Promise((resolve, reject) => {
        let statement = userSelect;
        if (keys && keys.length) {
            const innerKeys = keys.join("','");
            statement = statement + ` where key IN ('${innerKeys}')`;
        }
        db.all(statement, (err, rows: UserResponse[]) => {
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

export function saveUser(user: UserResponse): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!user) {
            reject(new Error("must have a user to save"));
            return;
        }

        let valuesStatement = "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8);";
        let valuesObject = {
            1: user.key,
            2: user.email,
            3: user.displayName ? user.displayName : "",
            4: user.firstName ? user.firstName : "",
            5: user.lastName ? user.lastName : "",
            6: user.role,
            7: user.points ? user.points : 0,
            8: user.imageUrl
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

export function updateUser(user: UserResponse): Promise<boolean> {
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
        if (user.imageUrl) {
            updateFields.push("imageurl = ?6");
            updateObject[6] = user.imageUrl;
        }
        if (user.faveDriver) {
            updateFields.push("favedriver = ?7");
            updateObject[7] = user.faveDriver;
        }
        if (user.faveTeam) {
            updateFields.push("faveteam = ?8");
            updateObject[8] = user.faveTeam;
        }
        if (!updateFields.length) {
            reject("nothing to update");
            return;
        }

        let fieldStatement = updateFields.join(",");
        updateStatement += fieldStatement;
        let where = " WHERE key = ?9";
        updateObject[9] = user.key;
        updateStatement += where;
        db.run(updateStatement, updateObject, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}