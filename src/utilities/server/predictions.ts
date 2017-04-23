import { baseUrl } from "../ServerUtils";
import { FinalPickPayload } from "../../../common/payloads/FinalPickPayload";
import { UserPickPayload } from "../../../common/payloads/UserPickPayload";
import { PredictionResponse, ModifierResponse } from "../../../common/responses/PredictionResponse";

export function getPredictions(raceKey: string, id_token: string): Promise<PredictionResponse[]> {
    return new Promise<PredictionResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/predictions/${raceKey}`, {
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

export function getModifiers(raceKey: string, predictionKey: string, id_token:string): Promise<ModifierResponse[]> {
    return new Promise<ModifierResponse[]>((resolve, reject) => {
        return fetch(`/predictions/modifiers/${raceKey}/${predictionKey}`,{
            method:"GET",
            headers:{
                'Authorization':"Bearer " + id_token
            }
        }).then(response => {
            return response.json().then((modifiers: ModifierResponse[]) => {
                if (response.ok) {
                    resolve(modifiers);
                }
                else {
                    reject(new Error((modifiers as any).message));
                }
            });
        }).catch(error => {
            reject(error);
        });
    });
}

/**
 * Save the outcome of a race
 * @param raceKey 
 * @param predictionChoices  
 */
export function savePredictionOutcomes(raceKey: string, outcomes: FinalPickPayload[], id_token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        return fetch(`${baseUrl}/admin/races/${raceKey}/predictions/finals`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(outcomes)
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