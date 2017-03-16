import { DriverModel, DriverResponse } from "./Driver";
import { getTeamByAbbreviation } from "../../src/utilities/ServerUtils";
export class TeamModel {
    name: string;
    abbreviation: string;
    headquartersCity: string;
    points: number;
    drivers: DriverModel[];
    key: string;
    trivia: string[];
    display:string;
    value:TeamModel;

    /**
     *
     */
    constructor(teamResponse: TeamResponse) {
        this.key = teamResponse.key;
        this.abbreviation = teamResponse.abbreviation;
        this.headquartersCity = teamResponse.headquartersCity;
        this.name = teamResponse.name;
        this.points = teamResponse.points;
        this.display = this.name;
        this.value = this;
    }

    /**
     * Returns the json of the Team. Does not include driver information.
     */
    get json(): TeamResponse {
        const team: TeamResponse = {
            key: this.key,
            name: this.name,
            abbreviation: this.name,
            headquartersCity: this.headquartersCity,
            trivia: this.trivia,
            points: this.points
        };
        return team;
    }

    update(){

    }
}

export { getTeamByAbbreviation };

export interface TeamResponse {
    key: string;
    name: string;
    trivia?: string[];
    abbreviation?: string;
    headquartersCity?: string;
    points?: number;
}
