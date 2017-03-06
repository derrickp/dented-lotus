"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
