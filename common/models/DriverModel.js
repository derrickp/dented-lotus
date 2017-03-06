"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DriverModel = (function () {
    /**
     *
     */
    function DriverModel(driverResponse) {
        this.firstName = driverResponse.firstName;
        this.lastName = driverResponse.lastName;
        this.nationality = driverResponse.nationality;
        this.flag = driverResponse.flag;
        this.age = driverResponse.age;
        this.number = driverResponse.number;
        this.abbreviation = driverResponse.abbreviation;
        // TeamModel.getTeamByAbbreviation(driverResponse.team).then((team)=>{
        //     this.team = team;
        // });
    }
    DriverModel.prototype.getName = function () {
        return this.name; //this.firstName + " " + this.lastName;
    };
    DriverModel.prototype.addPoints = function (inPoints) {
        if (inPoints < 0) {
            return;
        }
        this.points += inPoints;
    };
    return DriverModel;
}());
exports.DriverModel = DriverModel;
