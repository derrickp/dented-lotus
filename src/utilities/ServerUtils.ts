
import { TrackResponse } from "../../common/models/Track";
import { DriverModel, DriverResponse } from "../../common/models/Driver";
import { RaceResponse } from "../../common/models/Race";
import { UserPickPayload } from "../../common/models/Prediction";
import { TeamModel, TeamResponse } from "../../common/models/Team";
import { UserResponse } from "../../common/models/User";
import { SignupInfo } from "../../common/models/Signup";
import { AuthenticationPayload, AuthenticationResponse } from "../../common/models/Authentication";

const baseUrl = window.location.origin;

export function getAllTracks(): Promise<TrackResponse[]> {
    return new Promise<TrackResponse[]>((resolve, reject) => {
        return fetch(baseUrl + "/tracks").then(response => {
            return response.json().then((tracks: TrackResponse[]) => {
                resolve(tracks);
            });
        });
    });
}

export function getTrack(key: string): Promise<TrackResponse> {
    return new Promise<TrackResponse>((resolve, reject) => {
        return fetch(`/tracks/${key}`).then(response => {
            return response.json().then((tracks: TrackResponse[]) => {
                if (tracks.length) {
                    resolve(tracks[0]);
                } else {
                    resolve(null);
                }
            });
        });
    });
}

export function getAllRaces(season: number, id_token: string): Promise<RaceResponse[]> {
    return new Promise<RaceResponse[]>((resolve, reject) => {
        return fetch(`/races/${season}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + id_token
            }
        }).then(response => {
            return response.json().then((races: RaceResponse[]) => {
                resolve(races);
            });
        });
    });
}

export function saveRaces(season: number, races: RaceResponse[], id_token: string): Promise<RaceResponse[]> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<RaceResponse[]>((resolve, reject) => {
        return fetch(`/races/${season}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(races)
        }).then(response => {
            return response.json().then((raceResponses: RaceResponse[]) => {
                resolve(raceResponses);
            });
        });
    });
}

export function getRace(key: string): Promise<RaceResponse> {
    return new Promise<RaceResponse>((resolve, reject) => {
        return fetch(`/races/${key}`).then(response => {
            return response.json().then((race: RaceResponse) => {
                resolve(race);
            });
        });
    });
}


export function getAllDrivers(activeOnly: boolean = true): Promise<DriverResponse[]> {
    return new Promise<DriverResponse[]>((resolve, reject) => {
        let suffix = "/drivers";
        if (activeOnly) {
            suffix += "/active";
        }
        return fetch(baseUrl + "/drivers").then(response => {
            return response.json().then((drivers: DriverResponse[]) => {
                resolve(drivers);
            });
        });
    });
}

export function getDriver(key: string): Promise<DriverResponse> {
    return new Promise<DriverResponse>((resolve, reject) => {
        return fetch(baseUrl + `/drivers/${key}`).then(response => {
            return response.json().then((drivers: DriverResponse[]) => {
                if (drivers.length) {
                    resolve(drivers[0]);
                } else {
                    resolve(null);
                }
            });
        });
    });
}

export function saveDrivers(drivers: DriverModel[], id_token: string): Promise<DriverModel[]> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<DriverModel[]>((resolve, reject) => {
        const driversPayload: DriverResponse[] = [];
        drivers.forEach(dm => {
            const driver = dm.json;
            driversPayload.push(driver);
        });
        return fetch('/admin/drivers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(driversPayload)
        }).then(response => {
            return response.json().then((driverResponse: DriverResponse[]) => {
                resolve(driverResponse.map((d) => { return new DriverModel(d) }));
            });
        });
    });
}


export function saveTeams(teams: TeamModel[], id_token: string): Promise<TeamModel[]> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<TeamModel[]>((resolve, reject) => {
        const teamPayload: TeamResponse[] = [];
        teams.forEach(dm => {
            const team = dm.json;
            teamPayload.push(team);
        });
        return fetch('/admin/teams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(teams)
        }).then(response => {
            return response.json().then((teams: TeamResponse[]) => {
                resolve(teams.map((d) => { return new TeamModel(d) }));
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

export function getAllTeams( ): Promise<TeamModel[]> {
    return new Promise<TeamModel[]>((resolve, reject) => {
        return fetch(baseUrl + "/teams/").then(response => {
            return response.json().then((teams: TeamResponse[]) => {
                teams.sort((a,b)=>{ return a.name.localeCompare(b.name);});
                resolve(teams.map((team)=>{return new TeamModel(team)}));
            });
        });
    });
}

export function authenticate(authPayload: AuthenticationPayload): Promise<AuthenticationResponse> {
    return new Promise<UserResponse>((resolve, reject) => {
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

export function saveUserPicks(picks: UserPickPayload[], id_token: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        return fetch("/picks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + id_token
            },
            body: JSON.stringify(picks)
        }).then(response => {
            return response.json().then(json => {
                if (response.ok) {
                    resolve(true);
                }
                else {
                    reject(new Error(json.message));
                }
            });
        }).catch(error => {
            reject(error);  
        });
    });
}

export function signup(info: SignupInfo): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        return fetch("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(info)
        }).then(response => {
            return response.json().then(json => {
                if (response.ok) {
                    resolve(true);
                }
                else {
                    reject(new Error(json.message));
                }
            });
        });
    });
}
