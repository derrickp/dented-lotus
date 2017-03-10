export interface PredictionResponse {
    key: string;
    description?: string;
    title: string;
    type: string;
    allSeason: boolean;
    numChoices: number;
    value: number;
    modifier: number;
    outcome?: string[];
    userPick?: string[];
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