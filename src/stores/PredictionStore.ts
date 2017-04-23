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
    getDriver: (key: string) => DriverModel;
    getTeam: (key: string) => TeamModel;
    getToken: () => string;

    constructor(getToken: () => string, getDriver: (key: string) => DriverModel, getTeam: (key: string) => TeamModel) {
        this.getPredictions = this.getPredictions.bind(this);
        this.getToken = getToken;
        this.getDriver = getDriver;
        this.getTeam = getTeam;
        this.initialize = this.initialize.bind(this);
        // this.get = this.get.bind(this);
        // this.getAll = this.getAll.bind(this);
        // this.save = this.save.bind(this);
        // this.create = this.create.bind(this);
        // this.refresh = this.refresh.bind(this);
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    getPredictions(raceKey: string): Promise<PredictionModel[]> {
        return new Promise<PredictionModel[]>((resolve, reject) => {
            return getPredictionResponses(raceKey, this.getToken()).then(predictionResponses => {
                const modifierPromises: Promise<ModifierResponse[]>[] = [];
                for (const pr of predictionResponses) {
                    modifierPromises.push(serverGetModifiers(pr.raceKey, pr.key, this.getToken()));
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
            return getAllSeasonPredictions(this.getToken()).then(predictionResponses => {
                const modifierPromises: Promise<ModifierResponse[]>[] = [];
                for (const pr of predictionResponses) {
                    modifierPromises.push(serverGetModifiers(pr.raceKey, pr.key, this.getToken()));
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
                const payload: UserPickPayload[] = [];
                payload.push({
                    race: model.predictionResponse.raceKey,
                    prediction: model.predictionResponse.key,
                    choice: model.predictionResponse.userPick
                });
                return saveUserPicks(payload, this.getToken());
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