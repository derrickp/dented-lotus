
import { TeamModel, getTeamByAbbreviation, TeamResponse } from "./Team";
import { TrackModel } from "./Track";
import { RaceModel } from "./Race";
export interface DriverModelContext {
    getTrack?: (key: string) => Promise<TrackModel>;
    getRace?: (key: string) => Promise<RaceModel>;
    saveDriver?: (model:DriverModel) => Promise<boolean>;
}

export class DriverModel {
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
    team: TeamModel; //TeamModel;
    wins: number;
    trivia: string[];
    private save: (model:DriverModel)=>Promise<boolean>;
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

        if (context){
            this.save = context.saveDriver;
        }

        // TeamModel.getTeamByAbbreviation(driverResponse.team).then((team)=>{
        //     this.team = team;
        // });


    } 

    public update(){
        this.save(this);
    }


    public getName(): string {
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