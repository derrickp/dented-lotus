"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var Race = (function (_super) {
    __extends(Race, _super);
    function Race(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            race: null
        };
        props.race.then(function (race) {
            _this.setState({ race: race });
        });
        return _this;
    }
    Race.prototype.render = function () {
        if (!this.state.race) {
            return React.createElement("div", null, "Loading... ");
        }
        else {
            return React.createElement("div", { className: "panel" },
                " ",
                this.state.race.displayName,
                " ");
        }
    };
    return Race;
}(React.Component));
exports.Race = Race;
