"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var HeaderSection = (function (_super) {
    __extends(HeaderSection, _super);
    function HeaderSection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeaderSection.prototype.render = function () {
        return React.createElement("div", { className: "header-section" });
    };
    return HeaderSection;
}(React.Component));
exports.HeaderSection = HeaderSection;
