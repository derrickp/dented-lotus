
import { TrackResponse } from "../responses/TrackResponse";

export class TrackModel {
    key: string;
    trackResponse: TrackResponse;

    constructor(trackResponse: TrackResponse, context?: any) {
        this.trackResponse = trackResponse;
        this.key = trackResponse.key;
    }

    get json(): TrackResponse {
        return this.trackResponse;
    }
}