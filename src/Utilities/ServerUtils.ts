
import { Track } from "../../common/models/Track";
import { DriverModel, DriverResponse } from "../../common/models/DriverModel";
import { TeamModel, TeamResponse } from "../../common/models/TeamModel";
import { DentedLotusUser } from "../../common/models/User";
import { AuthenticationPayload, AuthenticationResponse } from "../../common/models/Authentication";

const baseUrl = window.location.origin;

export function getAllTracks(): Promise<Track[]> {
    return new Promise<Track[]>((resolve, reject) => {
        return fetch(baseUrl + "/tracks").then(response => {
            return response.json().then((tracks: Track[]) => {
                resolve(tracks);
            });
        });
    });
}

export function getAllDrivers(): Promise<DriverModel[]> {
    return new Promise<DriverModel[]>((resolve, reject) => {
        return fetch(baseUrl + "/drivers").then(response => {
            return response.json().then((drivers: DriverResponse[]) => {
                resolve(drivers.map((d) => { return new DriverModel(d) }));
            });
        });
    });
}

export function getTeamByAbbreviation(abbreviation: string): Promise<TeamModel> {
    return new Promise<TeamModel>((resolve, reject) => {
        return fetch(baseUrl + "/teams/" + abbreviation).then(response => {
            return response.json().then((team: TeamResponse) => {
                resolve(new TeamModel(team));
            });
        });
    });
}

export function authenticate(authPayload: AuthenticationPayload): Promise<AuthenticationResponse> {
    return new Promise<DentedLotusUser>((resolve, reject) => {
        return fetch('/users/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(authPayload)
        }).then(response => {
            return response.json().then((authResponse: AuthenticationResponse) => {
                resolve(authResponse);
            });
        });
    });
}
