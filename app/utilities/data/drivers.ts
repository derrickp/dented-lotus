import * as sqlite3 from "sqlite3";

import { Driver } from "../../../common/models/DriverModel";

const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

const driverSelect = "SELECT * from drivers_vw";

export function saveDrivers(drivers: Driver[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const insert = "INSERT OR REPLACE INTO drivers (key, active, name, teamkey, trivia) VALUES (?1, ?2, ?3, ?4, ?5)";
            db.serialize(() => {
                db.exec("BEGIN;");

                drivers.forEach(driver => {
                    let valuesObject = {
                        1: driver.key,
                        2: driver.active ? 1 : 0,
                        3: driver.name,
                        4: driver.teamKey,
                        5: driver.trivia ? JSON.stringify(driver.trivia) : ""
                    };
                    db.run(insert, valuesObject);
                });
                db.exec("COMMIT;");
                resolve(true);
            });
        } catch (exception) {
            console.log(exception);
            db.exec("ROLLBACK;");
            reject(exception);
        }
    });
}

export function getDrivers(active, key?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let whereStatement: string;
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
        db.all(driverSelect + " " + whereStatement, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            rows.forEach(row => {
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
};