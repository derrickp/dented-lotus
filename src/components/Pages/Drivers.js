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
var DriverComponent_1 = require("../widgets/DriverComponent");
var Drivers = (function (_super) {
    __extends(Drivers, _super);
    function Drivers(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            drivers: []
        };
        _this.props.drivers.then(function (drivers) {
            drivers.sort(function (driver1, driver2) {
                if (driver1.getName() < driver2.getName()) {
                    return -1;
                }
                if (driver1.getName() > driver2.getName()) {
                    return 1;
                }
                return 0;
            });
            _this.setState({ drivers: drivers });
        });
        return _this;
    }
    Drivers.prototype.render = function () {
        if (!this.state.drivers.length) {
            return React.createElement("div", null, "Loading...");
        }
        var entries = this.state.drivers.map(function (driver) {
            return React.createElement("li", { key: driver.abbreviation, className: "panel" },
                React.createElement(DriverComponent_1.DriverComponent, { key: driver.abbreviation, driver: driver, small: true }));
        });
        return React.createElement("ul", null, entries);
    };
    return Drivers;
}(React.Component));
exports.Drivers = Drivers;
