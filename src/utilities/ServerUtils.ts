
import { TrackResponse } from "../../common/responses/TrackResponse";
import { DriverResponse } from "../../common/responses/DriverResponse";
import { RacePrediction, PredictionChoices } from "../../common/models/Race";
import { RaceResponse } from "../../common/responses/RaceResponse";
import { BlogResponse } from "../../common/responses/BlogResponse"; 

export let baseUrl = `${window.location.origin}`;
if (baseUrl.indexOf(":8080") < 0) {
    baseUrl += ":8080";
}

/**
 * 
 * @param urlFragment the fragment of the url to send to (what follows the baseUrl)
 * @param body JSON.stringified JSON data to send to the endpoint. Only works with POST
 * @param id_token The id_token to send along on the request
 */
export function sendToEndpoint(urlFragment: string, body: string, id_token: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        return fetch(`${baseUrl}${urlFragment}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: body
        }).then(response => {
            return response.json().then(value => {
                if (response.ok) {
                    resolve(value);
                }
                else {
                    reject(new Error(value.message));
                }
            });
        }).catch(reject);
    });
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

export function saveBlog(blog: BlogResponse, id_token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        return fetch(`${baseUrl}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(blog)
        }).then(response => {
            if (response.ok) {
                resolve();
            }
            else {
                reject(new Error("error saving blog"));
            }
        })
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

export function getAllRaces(season: number): Promise<RaceResponse[]> {
    return new Promise<RaceResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/races/${season}`).then(response => {
            return response.json().then((races: RaceResponse[]) => {
                resolve(races);
            });
        });
    });
}

export function saveRaces(season: number, races: RaceResponse[], id_token: string): Promise<RaceResponse[]> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<RaceResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/admin/races/${season}`, {
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

export function saveRacePredictions(raceKey: string, racePredictions: RacePrediction[], id_token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        return fetch(`${baseUrl}/admin/races/${raceKey}/predictions`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(racePredictions)
        }).then(response => {
            if (response.ok) {
                resolve();
            }
            else {
                return response.json().then(json => {
                    reject(new Error(json.message));
                });
            }
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