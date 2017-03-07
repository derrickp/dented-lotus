
import { Track } from "../../common/models/Track";
import { DriverModel, Driver } from "../../common/models/DriverModel";
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
            return response.json().then((drivers: Driver[]) => {
                resolve(drivers.map((d) => { return new DriverModel(d) }));
            });
        });
    });
}

export function saveDrivers(drivers: DriverModel[], id_token: string): Promise<DriverModel[]> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<DriverModel[]>((resolve, reject) => {
        const driversPayload: Driver[] = [];
        drivers.forEach(dm => {
            const driver = dm.json;
            driversPayload.push(driver);
        });
        return fetch('/drivers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(drivers)
        }).then(response => {
            return response.json().then((driverResponse: Driver[]) => {
                resolve(driverResponse.map((d) => { return new DriverModel(d) }));
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
