"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var Menu = (function (_super) {
    __extends(Menu, _super);
    /**
     *
     */
    function Menu(props) {
        var _this = _super.call(this, props) || this;
        _this.menuItems = [];
        _this.state = { menuItems: [] };
        return _this;
    }
    Menu.prototype.componentDidMount = function () {
        var menuItems = [];
        menuItems.push({
            displayName: "Menu Item 1",
            stateManager: this.props.stateManager,
            subMenuItems: [],
            action: function () {
                console.log("MenuItem1");
            }
        });
        menuItems.push({
            displayName: "Menu Item 2",
            stateManager: this.props.stateManager,
            action: function () {
                console.log("MenuItem2");
            }
        });
        menuItems.push({
            displayName: "Menu Item 3",
            stateManager: this.props.stateManager,
            action: function () {
                console.log("MenuItem3");
            }
        });
        this.setState({ menuItems: menuItems });
    };
    Menu.prototype.render = function () {
        var out = [];
        this.state.menuItems.forEach(function (mi, i) {
            out.push(React.createElement("li", { onClick: function () { mi.action(); }, key: i }, mi.displayName));
        });
        return React.createElement("ul", { className: "menu" }, out);
    };
    return Menu;
}(React.Component));
exports.Menu = Menu;
