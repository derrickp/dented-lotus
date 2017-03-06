import {DriverModel} from "./DriverModel";
import {getTeamByAbbreviation} from "../../src/Utilities/ServerUtils";
export class TeamModel{
    name:string;
    abbreviation:string;
    headquartersCity:string;
    points:number;
    drivers: DriverModel[];
    
    static getTeamByAbbreviation(abbreviation:string):Promise<TeamModel>{
        return getTeamByAbbreviation(abbreviation);
    }

    /**
     *
     */
    constructor(teamResponse:TeamResponse) {
        
        
    }
}

export interface TeamResponse{

}