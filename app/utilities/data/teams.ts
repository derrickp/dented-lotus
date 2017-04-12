import * as sqlite3 from "sqlite3";

import { TeamResponse } from "../../../common/models/Team";

const db = new sqlite3.Database('app/Data/' + process.env.DBNAME);

const teamSelect = "select * from teams_vw";

export function getTeams(keys?: string[]): Promise<DbTeam[]> {
    return new Promise((resolve, reject) => {
        let statement: string = teamSelect;
        if (keys && keys.length) {
            const innerKeys = keys.join("','");
            statement = statement + " where key IN ('" + innerKeys + "')";
        }
        db.all(statement, (err: Error, rows: DbTeam[]) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(rows);
        });
    });
}

export async function saveTeams(teams: TeamResponse[]): Promise<boolean> {
    // Only save the teams with a key
    teams = teams.filter(t => t.key);
    if (!teams.length) {
        return true;
    }
    const keys = teams.map(t => t.key);
    const existingTeams = await getTeams(keys);
    await new Promise((resolve, reject) => {
        try {
            const insert = `INSERT OR REPLACE INTO teams 
            (key, name, trivia, headquarterscity, points, abbreviation) 
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)`;
            db.serialize(() => {
                db.exec("BEGIN;");
                for (const team of teams) {
                    const existingTeam = existingTeams.filter(t => {
                        return t.key === team.key;
                    })[0];
                    const values = {
                        1: team.key
                    };
                    // name
                    if (team.name) {
                        values[2] = team.name;
                    }
                    else {
                        values[2] = existingTeam ? existingTeam.name : null;
                    }
                    // trivia
                    if (team.trivia) {
                        values[3] = JSON.stringify(team.trivia);
                    }
                    else {
                        values[3] = existingTeam ? JSON.stringify(existingTeam.trivia) : JSON.stringify([]);
                    }
                    //headquarterscity
                    if (team.headquartersCity) {
                        values[4] = team.headquartersCity;
                    }
                    else {
                        values[4] = existingTeam ? existingTeam.headquartersCity : null;
                    }
                    // points
                    if (team.points) {
                        values[5] = team.points;
                    }
                    else {
                        values[5] = existingTeam ? existingTeam.points : 0;
                    }
                    // abbreviation
                    if (team.abbreviation) {
                        values[6] = existingTeam.abbreviation;
                    }
                    else {
                        values[6] = existingTeam ? existingTeam.abbreviation : null;
                    }

                    db.run(insert, values);
                }
                db.exec("COMMIT;", (commitError) => {
                    if (commitError) {
                        reject(commitError);
                    }
                    else {
                        resolve(true);
                    }
                });
            });
        } catch (exception) {
            console.error(exception);
            db.exec("ROLLBACK;");
            reject(exception);
        }
    });
    return true;
}

export async function getTeamResponses(keys?: string[]): Promise<TeamResponse[]> {
    const teams: TeamResponse[] = [];
    const teamRows = await getTeams(keys);
    if (teamRows && teamRows.length) {
        teamRows.forEach((teamRow) => {
            const team: TeamResponse = {
                key: teamRow.key,
                name: teamRow.name,
                trivia: teamRow.trivia ? JSON.parse(teamRow.trivia) : []
            };
            teams.push(team);
        });
    }
    return teams;
}

export interface DbTeam {
    key: string;
    name: string;
    trivia: string;
    headquartersCity: string;
    points: number;
    abbreviation: string;
}