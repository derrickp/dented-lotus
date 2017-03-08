import { TrackModel } from "./Track";
import { DriverModel } from "./Driver";
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

    initialize(): Promise<void> {
        this._initializePromise = this._initializePromise ? this._initializePromise : new Promise<void>((resolve, reject) => {
            if (!this._context) {
                return resolve();
            }
            const promises: Promise<any>[] = [];
            if (this._context) {
                if (this.raceResponse && this.raceResponse.track) {
                    promises.push(this._context.getTrack(this.raceResponse.track).then(trackModel => {
                        this.track = trackModel;
                    }));
                }
                if (this.raceResponse && this.raceResponse.winner) {
                    promises.push(this._context.getDriver(this.raceResponse.winner).then(driver => {
                        this.winner = driver;
                    }));
                }
            }
            return Promise.all(promises).then(() => {
                resolve();
            });
        });
        return this._initializePromise;


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
            track: this.track ? this.track.key : null,
            season: this.raceResponse.season,
            laps: this.raceResponse.laps,
            qualiDate: this.qualiDate ? this.qualiDate.toString() : null,
            raceDate: this.raceDate ? this.raceDate.toString() : null,
            displayName: this.raceResponse.displayName,
            winner: this.winner ? this.winner.key : null
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
    track?: string;
    trivia?: string[];
    cutoff?: string;
    winner?: string;
}