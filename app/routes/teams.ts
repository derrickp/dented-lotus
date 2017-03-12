
import { getTeams } from "../utilities/data/teams";
import { DriverResponse } from "../../common/models/Driver";
import { TeamResponse } from "../../common/models/Team";

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