import { DriverModel } from "./Driver";
import { DriverResponse } from "../responses/DriverResponse";
import { TeamResponse } from "../responses/TeamResponse";
import { TeamModel } from "./Team";
import { PredictionResponse, PredictionTypes, ModifierResponse } from "../responses/PredictionResponse";
import { Selectable, SelectableObject } from "./Selectable";

export interface PredictionContext {
    saveUserPicks: (model: PredictionModel) => Promise<boolean>;
    getDriver: (key: string) => DriverModel;
    getTeam: (key: string) => TeamModel;
}

export class PredictionModel {
    //Errors 
    static CHOICE_NOT_FOUND_ERROR = new Error("ChoiceNotFound");
    private _context: PredictionContext;
    predictionResponse: PredictionResponse;
    rawChoices: any;
    choices: SelectableObject[];

    constructor(response: PredictionResponse, modifiers: ModifierResponse[], context: PredictionContext) {
        this.predictionResponse = response;
        this.choices = modifiers.map((modifier) => {
            if (response.type === PredictionTypes.DRIVER) {
                const driver = context.getDriver(modifier.choice);
                return {
                    display: driver.display,
                    key: driver.key,
                    multiplier: modifier.modifier ? modifier.modifier : 1.0
                };
            }

            const team = context.getTeam(modifier.choice);
            return {
                display: team.display,
                key: team.key,
                multiplier: modifier.modifier ? modifier.modifier : 1.0
            };

        });
        this._context = context;
    }

    saveUserPicks(): Promise<boolean> {
        return this._context.saveUserPicks(this);
    }

    get json(): PredictionResponse {
        return this.predictionResponse;
    }
}