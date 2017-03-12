export interface TrackResponse {
    key: string;
    name: string;
    country: string;
    length?: number;
    title: string;
    trivia?: string[];
    description?: string;
    latitude?: number;
    longitude?: number;
}

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