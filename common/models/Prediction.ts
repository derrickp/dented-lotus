import { DriverModel } from "./Driver";
import { DriverResponse } from "../responses/DriverResponse";
import { PredictionResponse, PredictionTypes } from "../responses/PredictionResponse";
import { TeamResponse, TeamModel } from "./Team";
import { Selectable } from "./Selectable";

export interface PredictionContext {
    saveUserPicks: (model: PredictionModel) => Promise<boolean>;
    getDriver: (key: string) => DriverModel;
    getTeam: (key: string) => TeamModel;
}

export class PredictionModel {
    private _context: PredictionContext;
    predictionResponse: PredictionResponse;
    choices: Selectable[] = [];

    constructor(response: PredictionResponse, context: PredictionContext) {
        this.predictionResponse = response;
        for (const choice of response.choices) {
            if (response.type === PredictionTypes.DRIVER) {
                this.choices.push(context.getDriver(choice));
            }
            else {
                this.choices.push(context.getTeam(choice));
            }
        }
        this._context = context;
    }

    saveUserPicks(): Promise<boolean> {
        return this._context.saveUserPicks(this);
    }

    get json(): PredictionResponse {
        return this.predictionResponse;
    }
}