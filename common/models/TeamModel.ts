import { DriverModel } from "./Driver";
import { getTeamByAbbreviation } from "../../src/utilities/ServerUtils";
export class TeamModel {
    name: string;
    abbreviation: string;
    headquartersCity: string;
    points: number;
    drivers: DriverModel[];

    /**
     *
     */
    constructor(teamResponse: TeamResponse) {
    }
}

export { getTeamByAbbreviation };

export interface TeamResponse {

}