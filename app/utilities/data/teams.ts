import * as sqlite3 from "sqlite3";

import { TeamResponse } from "../../../common/models/Team";

const db = new sqlite3.Database('app/Data/formulawednesday.sqlite');

const teamSelect = "select * from teams_vw";

export function getTeams(keys?: string[]): Promise<DbTeam[]> {
    return new Promise((resolve, reject) => {
        let statement: string = teamSelect;
        if (keys && keys.length) {
            statement = statement + " where key IN ('" + keys.join("','") + "')";
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

export async function getTeamResponses(keys?: string[]): Promise<TeamResponse[]> {
    const teams: TeamResponse[] = [];
    const teamRows = await getTeams(keys);
    if (teamRows && teamRows.length) {
        const team: TeamResponse = {
            key: teamRows[0].key,
            name: teamRows[0].name,
            trivia: teamRows[0].trivia ? JSON.parse(teamRows[0].trivia) : []
        };
        teams.push(team);
    }
    return teams;
}

export interface DbTeam {
    key: string;
    name: string;
    trivia: string;
}