"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var moment = require("moment");
var RaceCountdown = (function (_super) {
    __extends(RaceCountdown, _super);
    /**
     *
     */
    function RaceCountdown(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { timeRemaining: 0 };
        _this.tick = _this.tick.bind(_this);
        _this.props.stateManager.getNextRace().then(function (race) {
            _this.nextRace = race;
        });
        _this.onclick = props.onclick;
        return _this;
    }
    RaceCountdown.prototype.componentDidMount = function () {
        this.interval = setInterval(this.tick, 1000);
    };
    RaceCountdown.prototype.componentWillUnmount = function () {
        clearInterval(this.interval);
    };
    RaceCountdown.prototype.tick = function () {
        if (!this.nextRace) {
            return;
        }
        var cutoffTime = moment(this.nextRace.date);
        var now = moment();
        var timeRemaining = cutoffTime.diff(now);
        var duration = moment.duration(timeRemaining, "milliseconds");
        var days = Math.floor(duration.asDays());
        var hours = Math.floor(duration.subtract(days, "days").asHours());
        var minutes = Math.floor(duration.subtract(hours, "hours").asMinutes());
        var seconds = Math.floor(duration.subtract(minutes, "minutes").asSeconds());
        var strHours = ("0" + hours.toString()).slice(-2);
        var strMinutes = ("0" + minutes.toString()).slice(-2);
        var strSeconds = ("0" + seconds.toString()).slice(-2);
        var output = "";
        if (days == 1) {
            output += days.toString() + " day ";
        }
        else if (days > 1) {
            output += days.toString() + " days, ";
        }
        output += strHours + ":" + strMinutes + ":" + strSeconds;
        this.setState({ timeRemaining: output });
    };
    RaceCountdown.prototype.render = function () {
        if (!this.nextRace) {
            return React.createElement("span", { className: "race-countdown" }, "Loading race countdown...");
        }
        return React.createElement("div", { className: "race-countdown" },
            React.createElement("span", null, this.nextRace.displayName),
            ":\u00A0",
            React.createElement("span", { className: "timer" }, this.state.timeRemaining),
            React.createElement("span", { onClick: this.onclick, className: "button" }, "Make Your Picks"));
    };
    return RaceCountdown;
}(React.Component));
exports.RaceCountdown = RaceCountdown;
