import { baseUrl } from "../ServerUtils";
import { PredictionResponse } from "../../../common/responses/PredictionResponse";

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