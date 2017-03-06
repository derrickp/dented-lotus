"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Pages_1 = require("../Pages");
var AllRaces = (function (_super) {
    __extends(AllRaces, _super);
    function AllRaces(props) {
        return _super.call(this, props) || this;
    }
    AllRaces.prototype.render = function () {
        var entries = this.props.races.map(function (race) {
            return React.createElement("li", { key: race.id, className: "panel" },
                React.createElement(Pages_1.RacePage, { key: race.id, race: Promise.resolve(race), small: true }));
        });
        return React.createElement("ul", null, entries);
    };
    return AllRaces;
}(React.Component));
exports.AllRaces = AllRaces;
