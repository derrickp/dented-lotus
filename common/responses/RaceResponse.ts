
export interface RaceResponse {
    displayName?: string;
    raceDate?: string;
    qualiDate?: string;
    season?: number;
    key: string;
    laps?: number;
    track: string;
    trivia?: string[];
    cutoff?: string;
    winner?: string;
    imageUrl: string;
    info: string;
}