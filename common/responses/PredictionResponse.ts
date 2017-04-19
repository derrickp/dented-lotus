export interface PredictionResponse {
    key: string;
    description?: string;
    title: string;
    type: string;
    allSeason: boolean;
    choices?: string[];
    value?: number;
    modifier?: number;
    outcome?: string[];
    userPick?: string;
    raceKey?: string;
}

export namespace PredictionTypes {
    export const DRIVER = "driver";
    export const TEAM = "team";
}