import * as sqlite3 from "sqlite3";

import { DriverResponse } from "../../../common/models/Driver";
import { getTeamResponses } from "./teams";

const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

const driverSelect = "SELECT * from drivers_vw";

export function saveDrivers(drivers: DriverResponse[]): Promise<boolean> {
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
                        5: driver.team ? driver.team.key : "",
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

export async function getDriverResponses(active?: boolean, keys?: string[]): Promise<DriverResponse[]> {
    console.log(keys);
    const driverRows = await getDrivers(false, keys);
    const drivers: DriverResponse[] = [];
    for (const driverRow of driverRows) {
        const driver: DriverResponse = {
            abbreviation: driverRow.abbreviation,
            active: driverRow.active ? true : false,
            birthdate: driverRow.birthdate,
            firstName: driverRow.firstName,
            lastName: driverRow.lastName,
            flag: driverRow.flag,
            nationality: driverRow.nationality,
            team: null,
            trivia: driverRow.trivia ? JSON.parse(driverRow.trivia) : [],
            key: driverRow.key
        };
        const teams = await getTeamResponses([driverRow.team]);
        if (teams && teams.length) {
            driver.team = teams[0];
        }
        drivers.push(driver);
    }
    return drivers;
}

export function getDrivers(active, keys?: string[]): Promise<DbDriver[]> {
    return new Promise((resolve, reject) => {
        let whereStatement: string;
        if (active) {
            whereStatement = "where active = 1";
        }
        else {
            whereStatement = "where active >= 0";
        }
        if (keys && keys.length) {
            const innerKeys = keys.join("','");
            whereStatement = whereStatement + " and key IN ('" + innerKeys + "')";
        }
        console.log(driverSelect + " " + whereStatement);
        db.all(driverSelect + " " + whereStatement, (err: Error, rows: DbDriver[]) => {
            if (err) {
                reject(err);
                return;
            }
            
            resolve(rows);
        });
    }); 
};

export interface DbDriver {
    key: string;
    trivia: string;
    firstName: string;
    lastName: string;
    nationality: string;
    active: number;
    flag?: string;
    points?: number;
    birthdate?: string;
    number?: number;
    abbreviation?: string;
    /**Abbreviation for the team */
    team?: string;
    wins?: number;
}