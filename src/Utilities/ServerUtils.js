"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DriverModel_1 = require("../../common/models/DriverModel");
var baseUrl = window.location.origin;
function getAllTracks() {
    return new Promise(function (resolve, reject) {
        return fetch(baseUrl + "/tracks").then(function (response) {
            return response.json().then(function (tracks) {
                resolve(tracks);
            });
        });
    });
}
exports.getAllTracks = getAllTracks;
function getAllDrivers() {
    return new Promise(function (resolve, reject) {
        return fetch(baseUrl + "/drivers").then(function (response) {
            return response.json().then(function (drivers) {
                resolve(drivers.map(function (d) { return new DriverModel_1.DriverModel(d); }));
            });
        });
    });
}
exports.getAllDrivers = getAllDrivers;
