import { DriverModel } from "./Driver";
import { DriverResponse } from "../responses/DriverResponse";  
import { TeamResponse } from "../responses/TeamResponse";
import { TeamModel } from "./Team"; 
import { PredictionResponse, PredictionTypes, ModifierResponse } from "../responses/PredictionResponse";  
import { Selectable, SelectableObject } from "./Selectable";
import { getModifiers } from "../../src/utilities/ServerUtils"; 

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
    choices: Selectable[] = [];
    private selectables: SelectableObject[] = [];
    private userToken;

    constructor(response: PredictionResponse, context: PredictionContext, id_token: string) {
        this.userToken = id_token;
        this.predictionResponse = response;
        for (const choice of response.choices) {
            if (response.type === PredictionTypes.DRIVER) {
                this.choices.push(context.getDriver(choice));
            }
            else {
                this.choices.push(context.getTeam(choice));
            }
        }
        this.createSelectables().then((selectables) => { this.selectables = selectables; });
        this._context = context;
    }

    createSelectables(): Promise<SelectableObject[]> {
        const race = this.predictionResponse.raceKey;
        const prediction = this.predictionResponse.key;
        // Querying these will give us a list of driver keys and modifiers. 
        const points = this.predictionResponse.value;
        return getModifiers(race, prediction, this.userToken).then((response) => {
            return this.choices.map((c) => {
                let modifier: number = response.filter((m) => { return m.choice == c.key; })[0].modifier;
                if (!modifier) {
                    modifier = 1;
                }
                return {
                    display: c.display,
                    key: c.key,
                    multiplier: modifier,
                    points: points
                }
            })
        });
    }

    getSelectable(): Promise<SelectableObject[]> {
        if (this.selectables.length) {
            return Promise.resolve(this.selectables);
        }
        return this.createSelectables().then(() => { return this.selectables });
    }

    saveUserPicks(): Promise<boolean> {
        return this._context.saveUserPicks(this);
    }

    get json(): PredictionResponse {
        return this.predictionResponse;
    }
}