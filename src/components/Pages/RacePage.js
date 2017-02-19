"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var RacePage = (function (_super) {
    __extends(RacePage, _super);
    function RacePage(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            race: null,
            small: _this.props.small
        };
        props.race.then(function (race) {
            _this.setState({ race: race });
        });
        return _this;
    }
    RacePage.prototype.toggleSize = function () {
        var size = this.state.small;
        this.setState({ small: !size });
    };
    RacePage.prototype.getSmall = function () {
        return React.createElement("div", { onClick: this.toggleSize.bind(this), className: "panel" },
            React.createElement("div", null,
                this.state.race.displayName,
                " - SMALL"),
            React.createElement("div", null, this.state.race.date.toDateString()),
            React.createElement("div", null, this.state.race.country));
    };
    RacePage.prototype.getFull = function () {
        return React.createElement("div", { onClick: this.toggleSize.bind(this), className: "panel" },
            React.createElement("div", null, this.state.race.displayName),
            React.createElement("div", null, this.state.race.date.toDateString()),
            React.createElement("div", null, this.state.race.country));
    };
    RacePage.prototype.render = function () {
        if (!this.state.race) {
            return React.createElement("div", null, "Loading... ");
        }
        else {
            if (this.state.small) {
                return this.getSmall();
            }
            else {
                return this.getFull();
            }
        }
    };
    return RacePage;
}(React.Component));
exports.RacePage = RacePage;
