"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var TrackPage = (function (_super) {
    __extends(TrackPage, _super);
    function TrackPage(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            track: props.track,
            small: _this.props.small
        };
        return _this;
    }
    TrackPage.prototype.toggleSize = function () {
        var size = this.state.small;
        this.setState({ small: !size });
    };
    TrackPage.prototype.getSmall = function () {
        return React.createElement("div", { onClick: this.toggleSize.bind(this), className: "panel" },
            React.createElement("div", null,
                this.state.track.name,
                " - SMALL"),
            React.createElement("div", null, this.state.track.country));
    };
    TrackPage.prototype.getFull = function () {
        return React.createElement("div", { onClick: this.toggleSize.bind(this), className: "panel" },
            React.createElement("div", null, this.state.track.name),
            React.createElement("div", null, this.state.track.country));
    };
    TrackPage.prototype.render = function () {
        if (!this.state.track) {
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
    return TrackPage;
}(React.Component));
exports.TrackPage = TrackPage;
