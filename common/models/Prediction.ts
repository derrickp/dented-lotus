import { DriverResponse } from "./Driver";
import { TeamResponse } from "./Team";

export interface PredictionResponse {
    key: string;
    description?: string;
    title: string;
    type: string;
    allSeason: boolean;
    numChoices: number;
    choices: any[]; //DriverResponse[] | TeamResponse[];
    value: number;
    modifier: number;
    outcome?: DriverResponse[] | TeamResponse[];
    userPicks?: DriverResponse[] | TeamResponse[];
}

export class PredictionModel {
    predictionResponse: PredictionResponse;

    constructor(response: PredictionResponse) {
        this.predictionResponse = response;
    }

    get json(): PredictionResponse {
        return this.predictionResponse;
    }
}

export interface UserPickPayload {
    race: string;
    prediction: string;
    choice: string;
}