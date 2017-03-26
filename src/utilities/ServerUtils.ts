
import { TrackResponse } from "../../common/models/Track";
import { DriverResponse } from "../../common/models/Driver";
import { RaceResponse } from "../../common/models/Race";
import { UserPickPayload } from "../../common/models/Prediction";
import { TeamResponse } from "../../common/models/Team";
import { UserResponse } from "../../common/models/User";
import { SignupInfo } from "../../common/models/Signup";
import { BlogResponse } from "../../common/models/Blog";
import { PublicUser } from "../../common/models/User";
import { PredictionResponse } from "../../common/models/Prediction";
import { AuthenticationPayload, AuthenticationResponse } from "../../common/models/Authentication";
 
let baseUrl = `${window.location.origin}`;
if (baseUrl.indexOf(":8080") == -1){
 baseUrl += ":8080";   
} 

export function getBlogs(): Promise<BlogResponse[]> {
    return new Promise<BlogResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/blogs`).then(response => {
            return response.json().then((blogResponse: BlogResponse[]) => {
                if (response.ok) {
                    resolve(blogResponse);
                }
                else {
                    reject(new Error((blogResponse as any).message));
                }
            });
        }).catch(error => {
            reject(error);  
        });
    });
}

export function getAllTracks(): Promise<TrackResponse[]> {
    return new Promise<TrackResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/tracks`).then(response => {
            return response.json().then((tracks: TrackResponse[]) => {
                resolve(tracks);
            });
        });
    });
}

export function getTrack(key: string): Promise<TrackResponse> {
    return new Promise<TrackResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/tracks/${key}`).then(response => {
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
        return fetch(`${baseUrl}/races/${season}`, {
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
        return fetch(`${baseUrl}/races/${season}`, {
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

export function getRace(season: number, key: string, id_token: string): Promise<RaceResponse> {
    return new Promise<RaceResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/races/${season}/${key}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + id_token
            }
        }).then(response => {
            return response.json().then((races: RaceResponse[]) => {
                resolve(races[0]);
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
        return fetch(`${baseUrl}/drivers`).then(response => {
            return response.json().then((drivers: DriverResponse[]) => {
                resolve(drivers);
            });
        });
    });
}

export function getDriver(key: string): Promise<DriverResponse> {
    return new Promise<DriverResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/drivers/${key}`).then(response => {
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

export function saveDrivers(driversPayload: DriverResponse[], id_token: string): Promise<DriverResponse[]> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<DriverResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/admin/drivers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(driversPayload)
        }).then(response => {
            return response.json().then((driverResponse: DriverResponse[]) => {
                resolve(driverResponse);
            });
        });
    });
}

export function createDriver(driverPayload: DriverResponse, id_token: string): Promise<DriverResponse> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<DriverResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/admin/drivers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(driverPayload)
        }).then(response => {
            return response.json().then((driverResponse: DriverResponse) => {
                resolve(driverResponse);
            });
        });
    });
}

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

export function getAllSeasonPredictions(id_token: string): Promise<PredictionResponse[]> {
    return new Promise<PredictionResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/allseason/predictions`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + id_token
            }
        }).then(response => {
            return response.json().then((predictions: PredictionResponse[]) => {
                resolve(predictions);
            });
        });
    });
}

export function getAllTeams( ): Promise<TeamResponse[]> {
    return new Promise<TeamResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/teams/`).then(response => {
            return response.json().then((teams: TeamResponse[]) => {
                teams.sort((a,b)=>{ return a.name.localeCompare(b.name);});
                resolve(teams);
            });
        });
    });
}

export function getAllPublicUsers():Promise<PublicUser[]>{
    return new Promise<PublicUser[]>((resolve, reject) => {
        return fetch(`${baseUrl}/allusers`).then(response => {
            return response.json().then((users: PublicUser[]) => { 
                resolve(users);
            });
        });
    });
}

export function authenticate(authPayload: AuthenticationPayload): Promise<AuthenticationResponse> {
    return new Promise<UserResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/users/authenticate`, {
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
        return fetch(`${baseUrl}/picks`, {
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
        return fetch(`${baseUrl}/signup`, {
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
