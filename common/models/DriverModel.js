"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DriverModel = (function () {
    /**
     *
     */
    function DriverModel(driverResponse) {
    }
    DriverModel.prototype.getName = function () {
        return this.firstName + " " + this.lastName;
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
