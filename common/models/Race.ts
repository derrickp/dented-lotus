import { TrackModel, TrackResponse } from "./Track";
import { DriverModel, DriverResponse } from "./Driver";
import { PredictionResponse, PredictionModel } from "./Prediction";

export interface RaceModelContext {
    getTrack?: (key: string) => Promise<TrackModel>;
    getDriver?: (key: string) => Promise<DriverModel>;
    saveRace?: (model: RaceModel) => Promise<boolean>;
}

export class RaceModel {
    private _context: RaceModelContext;
    private _initializePromise: Promise<void>;
    raceResponse: RaceResponse;
    key: string;
    track?: TrackModel;
    winner?: DriverModel;
    complete?: boolean;
    raceDate?: Date;
    qualiDate?: Date;
    cutoff?: Date;
    predictions: PredictionModel[];

    constructor(race: RaceResponse, context?: RaceModelContext) {
        this.raceResponse = race;
        // Putting here for ease of use
        this.key = race.key;
        if (race.raceDate) {
            this.raceDate = new Date(race.raceDate);
            this.complete = this.raceDate.getMilliseconds() < new Date().getMilliseconds();
        }
        if (race.qualiDate) this.qualiDate = new Date(race.qualiDate);
        if (race.cutoff) this.cutoff = new Date(race.cutoff);
        this._context = context;
    }

    async initialize(): Promise<void> {
        
    }

    save(): Promise<boolean> {
        if (!this._context || !this._context.saveRace) {
            return Promise.reject(new Error("Need valid context to save"));
        }
        return this._context.saveRace(this);
    }

    get json(): RaceResponse {
        const raceResponse: RaceResponse = {
            key: this.raceResponse.key,
            trivia: this.raceResponse.trivia,
            track: this.track ? this.track.json : null,
            season: this.raceResponse.season,
            laps: this.raceResponse.laps,
            qualiDate: this.qualiDate ? this.qualiDate.toString() : null,
            raceDate: this.raceDate ? this.raceDate.toString() : null,
            displayName: this.raceResponse.displayName,
            winner: this.winner ? this.winner.json : null,
            predictions: this.predictions.map(p => p.json)
        };
        return raceResponse;
    }
}

export interface RaceResponse {
    displayName?: string;
    raceDate?: string;
    qualiDate?: string;
    season?: number;
    key: string;
    laps?: number;
    track: TrackResponse;
    trivia?: string[];
    cutoff?: string;
    winner?: DriverResponse;
    predictions: PredictionResponse[];
}