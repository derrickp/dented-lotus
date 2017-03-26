
import { TeamModel, TeamResponse } from "./Team";
import { TrackModel } from "./Track";
import { RaceModel } from "./Race";
import { Selectable } from "./Selectable";

export interface DriverModelContext {
    saveDriver?: (model:DriverModel) => Promise<DriverModel[]>;
    getTeam?: (response: TeamResponse) => TeamModel;
} 

export class DriverModel implements Selectable {
    private _context: DriverModelContext;
    key: string;
    active: boolean;
    firstName: string;
    lastName: string;
    nationality: string;
    /**URL for flag image */
    flag: string;
    points: number;
    birthdate: string;
    number: number;
    abbreviation: string;
    team: TeamModel;
    wins: number;
    trivia: string[]; 
    /**
     *
     */
    constructor(driverResponse: DriverResponse, context?:DriverModelContext) {
        this.key = driverResponse.key;
        this.firstName = driverResponse.firstName;
        this.lastName = driverResponse.lastName;
        this.nationality = driverResponse.nationality;
        this.flag = driverResponse.flag;
        this.birthdate = driverResponse.birthdate;
        this.number = driverResponse.number;
        this.abbreviation = driverResponse.abbreviation;
        this.active = driverResponse.active;
        this.trivia = driverResponse.trivia;
        this.wins = driverResponse.wins; 
        this.points = driverResponse.points;
        this.team = driverResponse.team && context.getTeam(driverResponse.team);
        this._context = context;
    } 

    public update( ){
       return this._context.saveDriver(this);
    }

    get display() {
        return this.name + (this.team && " - " + this.team.name);
    }

    get name(): string {
        return this.firstName + " " + this.lastName;
    }

    public addPoints(inPoints: number): void {
        if (inPoints < 0) {
            return;
        }
        this.points += inPoints;
    }

    get json(): DriverResponse {
        const driver: DriverResponse = {
            key: this.key ? this.key : "",
            lastName: this.lastName,
            firstName: this.firstName,
            flag: this.flag,
            abbreviation: this.abbreviation,
            active: this.active,
            birthdate: this.birthdate,
            points: +this.points,
            nationality: this.nationality,
            team: this.team.json,
            trivia: this.trivia,
            wins: this.wins
        };
        return driver;
    }
}

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
    /**Abbreviation for the team */
    team?: TeamResponse;
    wins?: number;
}