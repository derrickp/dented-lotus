import { TrackModel, TrackResponse } from "./Track";
import { DriverModel } from "./Driver";
import { RaceResponse } from "../responses/RaceResponse";
import { DriverResponse } from "../responses/DriverResponse";
import { PredictionResponse } from "../responses/PredictionResponse";
import { PredictionModel } from "./Prediction";
import { getDurationFromNow } from "../utils/date";

export interface RaceModelContext {
    getTrack?: (key: string) => TrackModel;
    getDriver?: (key: string) => DriverModel;
    saveRace?: (model: RaceModel) => Promise<boolean>;
    refresh?: (race: RaceModel) => Promise<RaceModel>;
}

export class RaceModel {
    private _context: RaceModelContext;
    private _initializePromise: Promise<void>;
    raceResponse: RaceResponse;
    key: string;
    complete?: boolean;
    raceDate?: string;
    qualiDate?: string;
    cutoff?: string;
    imageUrl: string;
    info: string;

    constructor(race: RaceResponse, context?: RaceModelContext) {
        this.raceResponse = race;
        // Putting here for ease of use
        this.key = race.key;
        if (race.raceDate) {
            this.raceDate = race.raceDate;
            const d = getDurationFromNow(this.raceDate);
            this.complete = d.timeRemaining <= 0;
        }
        if (race.qualiDate) this.qualiDate = race.qualiDate;
        if (race.cutoff) {
            this.cutoff = race.cutoff;
        }
        else {
            this.cutoff = this.raceDate;
        }
        this.imageUrl = race.imageUrl;
        this._context = context;
    }

    get winner() {
        return this._context.getDriver(this.raceResponse.winner);
    }

    get track() {
        return this._context.getTrack(this.raceResponse.track);
    }

    refresh(): Promise<void> {
        return this._context.refresh(this).then(raceResponse => {
            
        });
    }

    save(): Promise<boolean> {
        if (!this._context || !this._context.saveRace) {
            return Promise.reject(new Error("Need valid context to save"));
        }
        return this._context.saveRace(this);
    }

    // addPrediction(predictionResponse: PredictionResponse) {
    //     const predictionIndex = this.predictions.findIndex(p => p.predictionResponse.key === predictionResponse.key);
    //     const prediction = this._context.getPrediction(predictionResponse)
    //     if (predictionIndex) {
    //         this.predictions.splice(predictionIndex, 1, prediction);
    //     }
    //     else {
    //         this.predictions.push(prediction);
    //     }
    // }

    // removePrediction(predictionResponse: PredictionResponse) {
    //     const predictionIndex = this.predictions.findIndex(p => p.predictionResponse.key === predictionResponse.key);
    //     if (predictionIndex >= 0) {
    //         this.predictions.splice(predictionIndex, 1);
    //     }
    // }

    get json(): RaceResponse {
        const raceResponse: RaceResponse = {
            key: this.raceResponse.key,
            trivia: this.raceResponse.trivia,
            track: this.track ? this.track.key : null,
            season: this.raceResponse.season,
            laps: this.raceResponse.laps,
            qualiDate: this.qualiDate ? this.qualiDate.toString() : null,
            raceDate: this.raceDate ? this.raceDate.toString() : null,
            displayName: this.raceResponse.displayName,
            winner: this.winner ? this.winner.key : null,
            imageUrl: "",
            info: this.info
        };
        return raceResponse;
    }
}

export interface RacePrediction {
    race: string;
    prediction: string;
    modifier: number;
    value: number;
}

export interface PredictionChoices {
    race: string;
    prediction: string;
    choices: string;
}