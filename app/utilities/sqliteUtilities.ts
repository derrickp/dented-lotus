'use strict';

import * as sqlite3 from "sqlite3";
import { getDrivers } from "./data/drivers";

const db = new sqlite3.Database('app/Data/' + process.env.DBNAME);
const blogQuery = "select blogs.message, blogs.title, blogs.userkey as userKey, blogs.postdate as postDate from blogs";
const topMessage = "select * from messageoftherace order by created_date DESC LIMIT 1 ";
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