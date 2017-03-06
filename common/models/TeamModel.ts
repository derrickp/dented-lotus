import {DriverModel} from "./DriverModel";
export class TeamModel{
    name:string;
    abbreviation:string;
    headquartersCity:string;
    points:number;
    drivers: DriverModel[];
    
}