export interface PredictionResponse {
    key: string;
    description?: string;
    title: string;
    type: string;
    allSeason: boolean;
    choices?: string[];
    value?: number; 
    outcome?: string[];
    userPick?: string;
    raceKey?: string;
}

export interface ModifierResponse{
    choice:string;
    modifier: number;
}

export namespace PredictionTypes {
    export const DRIVER = "driver";
    export const TEAM = "team";
}