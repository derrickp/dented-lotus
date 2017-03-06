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
var MenuItem = (function (_super) {
    __extends(MenuItem, _super);
    /**
     *
     */
    function MenuItem(props) {
        return _super.call(this, props) || this;
    }
    MenuItem.prototype.componentDidMount = function () {
    };
    MenuItem.prototype.render = function () {
        if (this.props.subMenuItems && this.props.subMenuItems.length > 0) {
            var subItems_1 = [];
            this.props.subMenuItems.forEach(function (mi) {
                subItems_1.push(mi.render());
            });
            return React.createElement("ul", null, subItems_1);
        }
        else {
            return React.createElement("li", { key: this.props.displayName }, this.props.displayName);
        }
    };
    return MenuItem;
}(React.Component));
exports.MenuItem = MenuItem;
