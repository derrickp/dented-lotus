import * as sqlite3 from "sqlite3";

import { Driver } from "../../../common/models/DriverModel";

const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

const driverSelect = "SELECT * from drivers_vw";

export function saveDrivers(drivers: Driver[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const insert = `INSERT OR REPLACE INTO drivers 
            (key, active, firstname, lastname, team, trivia, nationality, flag, birthdate, abbreviation, wins, number) 
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`;
            db.serialize(() => {
                db.exec("BEGIN;");

                drivers.forEach(driver => {
                    let valuesObject = {
                        1: driver.key,
                        2: driver.active ? 1 : 0,
                        3: driver.firstName ? driver.firstName : "",
                        4: driver.lastName,
                        5: driver.team ? driver.team : "",
                        6: driver.trivia ? JSON.stringify(driver.trivia) : "",
                        7: driver.nationality ? driver.nationality : "",
                        8: driver.flag ? driver.flag : "",
                        9: driver.birthdate ? driver.birthdate : "",
                        10: driver.abbreviation ? driver.abbreviation : "",
                        11: driver.wins ? driver.wins : 0,
                        12: driver.number ? driver.number : 0
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
            
            rows.forEach((row) => {
                if (row.active) {
                    row.active = true;
                }
                else {
                    row.active = false;
                }
                if (row.trivia) {
                    row.trivia = JSON.parse(row.trivia);
                }
            });
            resolve(rows);
        });
    }); 
};