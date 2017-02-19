"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var Pages_1 = require("../Pages");
var AllRaces = (function (_super) {
    __extends(AllRaces, _super);
    function AllRaces(props) {
        return _super.call(this, props) || this;
    }
    AllRaces.prototype.render = function () {
        var entries = this.props.races.map(function (race) {
            return React.createElement("li", { className: "panel" },
                React.createElement(Pages_1.RacePage, { key: race.id, race: Promise.resolve(race), small: true }));
        });
        return React.createElement("ul", null, entries);
    };
    return AllRaces;
}(React.Component));
exports.AllRaces = AllRaces;
