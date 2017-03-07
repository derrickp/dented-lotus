import { DriverModel } from "./DriverModel";
import { getTeamByAbbreviation } from "../../src/Utilities/ServerUtils";
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