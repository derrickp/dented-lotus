import {TeamModel} from "./TeamModel";
export class DriverModel{
    firstName:string;
    lastName:string;
    nationality:string;
    flag:string;
    points:number;
    age:number;
    number:number;
    abbreviation:string;
    team:TeamModel;

    public getName():string{
        return this.firstName + " " + this.lastName;
    }

    public addPoints(inPoints:number):void{
        if (inPoints < 0){
            return;
        }
        this.points += inPoints;
    }
 
}