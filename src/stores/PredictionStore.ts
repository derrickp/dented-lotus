import { User } from "../../common/models/User";
import { UserPickPayload } from "../../common/payloads/UserPickPayload";
import { PredictionModel, PredictionContext } from "../../common/models/Prediction";
import { DriverModel } from "../../common/models/Driver";
import { TeamModel } from "../../common/models/Team";
import {
    getPredictions as getPredictionResponses,
    getModifiers as serverGetModifiers,
    getAllSeasonPredictions,
    saveUserPicks
} from "../utilities/server/predictions";
import { PredictionResponse, ModifierResponse } from "../../common/responses/PredictionResponse";

export class PredictionStore {
    user: User;

    getDriver: (key: string) => DriverModel;
    getTeam: (key: string) => TeamModel;

    constructor() {
        this.getPredictions = this.getPredictions.bind(this);
    }

    getPredictions(raceKey: string): Promise<PredictionModel[]> {
        return new Promise<PredictionModel[]>((resolve, reject) => {
            return getPredictionResponses(raceKey, this.user.id_token).then(predictionResponses => {
                const modifierPromises: Promise<ModifierResponse[]>[] = [];
                for (const pr of predictionResponses) {
                    modifierPromises.push(serverGetModifiers(pr.raceKey, pr.key, this.user.id_token));
                }
                return Promise.all(modifierPromises).then((allModifiers) => {
                    const models = predictionResponses.map((pr, index) => {
                        const modifiers = allModifiers[index];
                        return new PredictionModel(pr, modifiers, this.predictionContext);
                    });
                    resolve(models);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }

    get allSeasonPredictions(): Promise<PredictionModel[]> {
        return new Promise<PredictionModel[]>((resolve, reject) => {
            return getAllSeasonPredictions(this.user.id_token).then(predictionResponses => {
                const modifierPromises: Promise<ModifierResponse[]>[] = [];
                for (const pr of predictionResponses) {
                    modifierPromises.push(serverGetModifiers(pr.raceKey, pr.key, this.user.id_token));
                }
                const allSeasonPredictions: PredictionModel[] = [];
                return Promise.all(modifierPromises).then((allModifiers) => {
                    const models = predictionResponses.map((pr, index) => {
                        const modifiers = allModifiers[index];
                        return new PredictionModel(pr, modifiers, this.predictionContext);
                    });
                    resolve(models);
                });
            });
        });
    }

    get predictionContext(): PredictionContext {
        return {
            saveUserPicks: (model: PredictionModel) => {
                if (!this.user.isLoggedIn) {
                    return Promise.reject(new Error("Need to be logged in to save"));
                }
                const payload: UserPickPayload[] = [];
                payload.push({
                    race: model.predictionResponse.raceKey,
                    prediction: model.predictionResponse.key,
                    choice: model.predictionResponse.userPick
                });
                return saveUserPicks(payload, this.user.id_token);
            },
            getDriver: (key: string) => {
                return this.getDriver(key);
            },
            getTeam: (key: string) => {
                return this.getTeam(key);
            }
        }
    }
}