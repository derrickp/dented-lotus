
import { baseUrl } from "../ServerUtils";

import { TeamResponse } from "../../../common/responses/TeamResponse";

export function saveTeams(teamPayload: TeamResponse[], id_token: string): Promise<TeamResponse[]> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<TeamResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/admin/teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(teamPayload)
        }).then(response => {
            return response.json().then((teams: TeamResponse[]) => {
                resolve(teams);
            });
        });
    });
}

export function getTeamByAbbreviation(abbreviation: string): Promise<TeamResponse> {
    return new Promise<TeamResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/teams/${abbreviation}`).then(response => {
            return response.json().then((team: TeamResponse) => {
                resolve(team);
            });
        });
    });
}

export function getAllTeams(): Promise<TeamResponse[]> {
    return new Promise<TeamResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/teams/`).then(response => {
            return response.json().then((teams: TeamResponse[]) => {
                teams.sort((a, b) => { return a.name.localeCompare(b.name); });
                resolve(teams);
            });
        });
    });
}