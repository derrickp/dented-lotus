export interface DriverResponse {
    key: string;
    trivia: string[];
    firstName: string;
    lastName: string;
    nationality: string;
    active?: boolean;
    flag?: string;
    points?: number;
    birthdate?: string;
    number?: number;
    abbreviation?: string;
    team?: string;
    wins?: number;
}