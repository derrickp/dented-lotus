"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RacePage_1 = require("./Pages/RacePage");
exports.RacePage = RacePage_1.RacePage;
var AllRaces_1 = require("./Pages/AllRaces");
exports.AllRaces = AllRaces_1.AllRaces;
var TrackPage_1 = require("./Pages/TrackPage");
exports.TrackPage = TrackPage_1.TrackPage;
var Tracks_1 = require("./Pages/Tracks");
exports.Tracks = Tracks_1.Tracks;
var Drivers_1 = require("./Pages/Drivers");
exports.Drivers = Drivers_1.Drivers;
var Pages = (function () {
    function Pages() {
    }
    return Pages;
}());
Pages.HOME = "home";
Pages.RACE = "race";
Pages.USER = "user";
Pages.DRIVERS = "drivers";
Pages.TRACKS = "tracks";
Pages.ALL_RACES = "all-races";
exports.Pages = Pages;
