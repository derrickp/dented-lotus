import { DriverResponse, DriverModel } from "./Driver";
import { TeamResponse, TeamModel } from "./Team";
import { Selectable } from "./Selectable";

export interface PredictionResponse {
    key: string;
    description?: string;
    title: string;
    type: string;
    allSeason: boolean;
    numChoices: number;
    choices: DriverResponse[] | TeamResponse[];
    value: number;
    modifier: number;
    outcome?: DriverResponse[] | TeamResponse[];
    userPicks?: string[];
}

export interface PredictionContext {
    saveUserPicks: (model: PredictionModel) => Promise<boolean>;
    getDriver: (response: DriverResponse) => DriverModel;
    getTeam: (response: TeamResponse) => TeamModel;
}

export class PredictionModel {
    private _context: PredictionContext;
    predictionResponse: PredictionResponse;
    choices: Selectable[] = [];
    userPicks: string[] = [];

    constructor(response: PredictionResponse, context: PredictionContext) {
        this.predictionResponse = response;
        for (const choice of response.choices) {
            if ((choice as DriverResponse).lastName) {
                this.choices.push(context.getDriver(choice as DriverResponse));
            }
            else {
                this.choices.push(context.getTeam(choice as TeamResponse));
            }
        }
        for (const userPick of response.userPicks) {
            this.userPicks.push(userPick);
        }
        this._context = context;
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