import { TrackModel, TrackResponse } from "./Track";
import { DriverModel, DriverResponse } from "./Driver";
import { PredictionResponse, PredictionModel } from "./Prediction";
import { getDurationFromNow } from "../utils/date";

export interface RaceModelContext {
    getTrack?: (response: TrackResponse) => TrackModel;
    getDriver?: (response: DriverResponse) => DriverModel;
    saveRace?: (model: RaceModel) => Promise<boolean>;
    getPrediction?: (response: PredictionResponse) => PredictionModel;
    refresh?:(race:RaceModel)=>Promise<void>;
}

export class RaceModel {
    private _context: RaceModelContext;
    private _initializePromise: Promise<void>;
    raceResponse: RaceResponse;
    key: string;
    track?: TrackModel;
    winner?: DriverModel;
    complete?: boolean;
    raceDate?: string;
    qualiDate?: string;
    cutoff?: string;
    predictions: PredictionModel[];
    imageUrl:string;
    info:string;

    constructor(race: RaceResponse, context?: RaceModelContext) {
        this.raceResponse = race;
        // Putting here for ease of use
        this.key = race.key;
        if (race.raceDate) {
            this.raceDate = race.raceDate;
            const d = getDurationFromNow(this.raceDate);
            this.complete = d.seconds <= 0;
        }
        if (race.qualiDate) this.qualiDate = race.qualiDate;
        if (race.cutoff) {
            this.cutoff = race.cutoff;
        }
        else {
            this.cutoff = this.raceDate;
        }
        this.predictions = race.predictions.map((p)=>{return context.getPrediction(p);});
        this.imageUrl = race.imageUrl;
        this._context = context;
        this.track = this._context.getTrack(race.track);
        if (race.winner) {
            this.winner = this._context.getDriver(race.winner);
        }
    }

    async initialize(): Promise<void> {
        
    }

    refresh():Promise<void>{
        return this._context.refresh(this);
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
            predictions: this.predictions.map(p => p.json),
            imageUrl:"",
            info: this.info
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
    imageUrl:string;
    info:string;
}