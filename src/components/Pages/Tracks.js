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
var TrackPage_1 = require("./TrackPage");
var Tracks = (function (_super) {
    __extends(Tracks, _super);
    function Tracks(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            tracks: []
        };
        _this.props.tracks.then(function (tracks) {
            tracks.sort(function (track1, track2) {
                if (track1.name < track2.name) {
                    return -1;
                }
                if (track1.name > track2.name) {
                    return 1;
                }
                return 0;
            });
            _this.setState({ tracks: tracks });
        });
        return _this;
    }
    Tracks.prototype.render = function () {
        if (!this.state.tracks.length) {
            return React.createElement("div", null, "Loading...");
        }
        var entries = this.state.tracks.map(function (track) {
            return React.createElement("li", { key: track.key, className: "panel" },
                React.createElement(TrackPage_1.TrackPage, { key: track.key, track: track, small: true }));
        });
        return React.createElement("ul", null, entries);
    };
    return Tracks;
}(React.Component));
exports.Tracks = Tracks;
