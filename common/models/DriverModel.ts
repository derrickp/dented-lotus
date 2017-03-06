import {TeamModel} from "./TeamModel";
export class DriverModel{
    firstName:string;
    lastName:string;
    nationality:string;
    /**URL for flag image */
    flag:string;
    points:number;
    birthdate:string;
    number:number;
    abbreviation:string;
    team:TeamModel;
    wins:number;
    /**
     *
     */
    constructor(driverResponse:DriverResponse) {
        this.firstName = driverResponse.firstName;
        this.lastName = driverResponse.lastName;
        this.nationality = driverResponse.nationality;
        this.flag = driverResponse.flag;
        this.birthdate = driverResponse.birthdate;
        this.number = driverResponse.number;
        this.abbreviation = driverResponse.abbreviation;
        // TeamModel.getTeamByAbbreviation(driverResponse.team).then((team)=>{
        //     this.team = team;
        // });

        
    }

    public update(data){}


    public getName():string{
        return  this.firstName + " " + this.lastName;
    }

    public addPoints(inPoints:number):void{
        if (inPoints < 0){
            return;
        }
        this.points += inPoints;
    }
 
}

export interface Driver {
    key: string;
    name: string;
    active: boolean;
    teamKey: string;
    trivia: string[];
}

export interface DriverResponse{
    key:string;
    trivia:string[];
    firstName:string;
    lastName:string;
    nationality:string;
    flag:string;
    points:number;
    birthdate:string;
    number:number;
    abbreviation:string;
    /**Abbreviation for the team */
    team:string;
    wins:number;

}