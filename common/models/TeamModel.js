"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServerUtils_1 = require("../../src/Utilities/ServerUtils");
var TeamModel = (function () {
    /**
     *
     */
    function TeamModel(teamResponse) {
    }
    TeamModel.getTeamByAbbreviation = function (abbreviation) {
        return ServerUtils_1.getTeamByAbbreviation(abbreviation);
    };
    return TeamModel;
}());
exports.TeamModel = TeamModel;
